import { Link, useNavigate } from 'react-router-dom';
import authService from '../services/auth.service';

export default function Navbar() {
  const navigate = useNavigate();
  const isAuthenticated = authService.isAuthenticated();
  const user = authService.getCurrentUser();

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  return (
    <header className="bg-blue-600 text-white p-4 flex justify-between items-center">
      <Link to="/" className="font-bold text-lg hover:text-blue-100">
        Course Management
      </Link>

      <nav className="flex items-center space-x-6">
        {isAuthenticated ? (
          <>
            {user?.role === 'INSTRUCTOR' && (
              <Link to="/admin/courses" className="hover:text-blue-100">
                Quản lý khóa học
              </Link>
            )}
            {user?.role === 'STUDENT' && (
              <Link to="/courses" className="hover:text-blue-100">
                Khóa học
              </Link>
            )}
            <span className="text-sm">{user?.name}</span>
            <button
              onClick={handleLogout}
              className="px-3 py-1 bg-red-500 rounded hover:bg-red-600"
            >
              Đăng xuất
            </button>
          </>
        ) : (
          <Link to="/login" className="px-3 py-1 bg-green-500 rounded hover:bg-green-600">
            Đăng nhập
          </Link>
        )}
      </nav>
    </header>
  );
}
