import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

export default function BaseLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="bg-gray-100 text-center p-2 text-xs">&copy; 2026 Course Management</footer>
    </div>
  );
}
