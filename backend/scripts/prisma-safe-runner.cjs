const { spawn } = require('child_process');
const { execSync } = require('child_process');

const prismaArgs = process.argv.slice(2);

if (prismaArgs.length === 0) {
  console.error('Usage: node scripts/prisma-safe-runner.cjs <prisma args...>');
  process.exit(1);
}

const maxRetries = 4;
const retryDelayMs = 1200;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isEngineLockError(output) {
  return (
    /EPERM: operation not permitted, rename/i.test(output) ||
    /EBUSY/i.test(output) ||
    /query_engine.*\.tmp/i.test(output)
  );
}

function tryReleaseCommonDevPorts() {
  if (process.platform !== 'win32') {
    return;
  }

  const script = [
    '$ports = @(3000,8000)',
    '$procIds = @()',
    'foreach ($port in $ports) {',
    '  $procIds += Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique',
    '}',
    '$procIds = $procIds | Where-Object { $_ } | Sort-Object -Unique',
    'foreach ($procId in $procIds) { Stop-Process -Id $procId -Force -ErrorAction SilentlyContinue }',
  ].join('; ');

  try {
    execSync(`powershell -NoProfile -Command "${script}"`, { stdio: 'ignore' });
  } catch {
    // best effort only
  }
}

function tryReleaseOtherNodeProcesses() {
  if (process.platform !== 'win32') {
    return;
  }

  const currentPid = process.pid;
  const script = [
    `$currentPid = ${currentPid}`,
    "Get-Process node -ErrorAction SilentlyContinue | Where-Object { $_.Id -ne $currentPid } | ForEach-Object { Stop-Process -Id $_.Id -Force -ErrorAction SilentlyContinue }",
  ].join('; ');

  try {
    execSync(`powershell -NoProfile -Command "${script}"`, { stdio: 'ignore' });
  } catch {
    // best effort only
  }
}

async function runOnce() {
  return new Promise((resolve) => {
    const cmd = `npx prisma ${prismaArgs.join(' ')}`;
    const child = spawn(cmd, { shell: true, stdio: ['inherit', 'pipe', 'pipe'] });

    let combined = '';

    child.stdout.on('data', (chunk) => {
      const text = chunk.toString();
      combined += text;
      process.stdout.write(text);
    });

    child.stderr.on('data', (chunk) => {
      const text = chunk.toString();
      combined += text;
      process.stderr.write(text);
    });

    child.on('close', (code) => {
      resolve({ code: code ?? 1, combined });
    });
  });
}

async function main() {
  for (let attempt = 0; attempt <= maxRetries; attempt += 1) {
    const result = await runOnce();

    if (result.code === 0) {
      return;
    }

    const lockError = isEngineLockError(result.combined);
    const noMoreRetries = attempt === maxRetries;

    if (!lockError || noMoreRetries) {
      if (lockError) {
        console.error(
          '\nPrisma engine file appears to be locked. Stop running Node/Nest/Next processes and retry.',
        );
      }

      process.exit(result.code);
    }

    tryReleaseCommonDevPorts();
    if (attempt >= 1) {
      tryReleaseOtherNodeProcesses();
    }

    console.warn(
      `\nDetected Prisma engine lock (attempt ${attempt + 1}/${maxRetries + 1}). Retrying in ${retryDelayMs}ms...`,
    );
    await sleep(retryDelayMs);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
