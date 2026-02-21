import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function upsertUserWithWallet(input: {
  email: string;
  fullName: string;
  role: 'ADMIN' | 'INSTRUCTOR' | 'STUDENT';
  password: string;
  balance: string;
}) {
  const passwordHash = await bcrypt.hash(input.password, 10);

  const user = await prisma.user.upsert({
    where: { email: input.email },
    update: {
      fullName: input.fullName,
      role: input.role,
      passwordHash,
    },
    create: {
      email: input.email,
      fullName: input.fullName,
      role: input.role,
      passwordHash,
    },
  });

  await prisma.wallet.upsert({
    where: { userId: user.id },
    update: { balance: input.balance },
    create: {
      userId: user.id,
      balance: input.balance,
    },
  });
}

async function main(): Promise<void> {
  await upsertUserWithWallet({
    email: 'admin@nestlearn.local',
    fullName: 'System Admin',
    role: 'ADMIN',
    password: 'Admin@123',
    balance: '0',
  });

  await upsertUserWithWallet({
    email: 'instructor@nestlearn.local',
    fullName: 'Demo Instructor',
    role: 'INSTRUCTOR',
    password: 'Instructor@123',
    balance: '0',
  });

  await upsertUserWithWallet({
    email: 'student@nestlearn.local',
    fullName: 'Demo Student',
    role: 'STUDENT',
    password: 'Student@123',
    balance: '1000',
  });
}

main()
  .catch((error) => {
    console.error('Seed failed', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
