import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import BaseLayout from './components/BaseLayout';
import HomePage from './pages/HomePage';
import CoursesPage from './pages/CoursesPage';
import AdminCoursesPage from './pages/admin/courses/AdminCoursesPage';

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
          <Route path="/" element={<BaseLayout />}>
            <Route index element={<HomePage />} />
            <Route path="courses" element={<CoursesPage />} />
            <Route path="admin/courses" element={<AdminCoursesPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
