import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="mx-auto max-w-3xl p-6 md:p-10">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-3xl font-bold text-slate-900">Nest-Learn</h1>
        <p className="mt-2 text-sm text-slate-600">Chọn khu vực để bắt đầu kiểm thử local.</p>
      </div>
      <ul className="mt-6 space-y-3 text-sm">
        <li>
          <Link href="/student/courses" className="inline-flex rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700">
            Student Courses
          </Link>
        </li>
        <li>
          <Link href="/instructor/courses" className="inline-flex rounded-lg bg-emerald-600 px-4 py-2 font-medium text-white hover:bg-emerald-700">
            Instructor Courses
          </Link>
        </li>
        <li>
          <Link href="/revenue" className="inline-flex rounded-lg bg-violet-600 px-4 py-2 font-medium text-white hover:bg-violet-700">
            Admin Revenue
          </Link>
        </li>
      </ul>
    </main>
  );
}
