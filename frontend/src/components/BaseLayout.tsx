import { Link, Outlet } from 'react-router-dom';

export default function BaseLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-blue-600 text-white p-4 flex justify-between">
        <div className="font-bold text-lg">Course Management</div>
        <nav className="space-x-4">
          <Link to="/">Home</Link>
          <Link to="/courses">Courses</Link>
          <Link to="/admin/courses">Admin</Link>
        </nav>
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="bg-gray-100 text-center p-2 text-xs">&copy; 2026 Course Management</footer>
    </div>
  );
}
