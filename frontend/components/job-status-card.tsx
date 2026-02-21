interface JobStatusCardProps {
  title: string;
  status: 'pending' | 'running' | 'failed' | 'completed';
}

export function JobStatusCard({ title, status }: JobStatusCardProps) {
  return (
    <div className="rounded-lg border border-gray-200 p-4">
      <h3 className="text-sm font-semibold">{title}</h3>
      <p className="mt-1 text-xs text-gray-600">Trạng thái: {status}</p>
    </div>
  );
}
