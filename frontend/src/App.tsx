import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import BaseLayout from './components/BaseLayout';
import CoursesPage from './pages/CoursesPage';
import AdminCoursesPage from './pages/admin/courses/AdminCoursesPage';
import LoginPage from './pages/LoginPage';
import ProtectedRoute from './components/ProtectedRoute';
import authService from './services/auth.service';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Public route: Login */}
          <Route path="/login" element={<LoginPage />} />

          {/* Protected routes */}
          <Route path="/" element={<BaseLayout />}>
            <Route
              index
              element={
                authService.isAuthenticated() ? (
                  <Navigate to="/courses" replace />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
            <Route
              path="courses"
              element={
                <ProtectedRoute>
                  <CoursesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="admin/courses"
              element={
                <ProtectedRoute requiredRole="INSTRUCTOR">
                  <AdminCoursesPage />
                </ProtectedRoute>
              }
            />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

