'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { apiGet, apiPost } from '../../../../lib/api-client';

interface LoginResponse {
  accessToken: string;
  tokenType: string;
}

interface PurchasedCourseItem {
  id: string;
  title: string;
  description?: string;
  price: number;
  enrolledAt: string;
}

export default function StudentMyCoursesPage() {
  const [courses, setCourses] = useState<PurchasedCourseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);

        const login = await apiPost<LoginResponse, { email: string; password: string }>('/auth/login', {
          email: 'student@nestlearn.local',
          password: 'Student@123',
        });

        const purchased = await apiGet<PurchasedCourseItem[]>('/users/my-courses', login.accessToken);
        setCourses(purchased);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Không thể tải khóa học đã mua');
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, []);

  return (
    <main className="mx-auto max-w-3xl p-6 md:p-10">
      <h1 className="text-2xl font-bold text-slate-900">Khóa học đã mua</h1>
      <p className="mt-2 text-sm">
        <Link href="/student/courses" className="text-blue-600 underline">
          Quay lại danh sách mua khóa học
        </Link>
      </p>

      {loading && <p className="mt-4 text-sm text-slate-500">Đang tải dữ liệu...</p>}
      {error && <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">Lỗi: {error}</p>}

      {!loading && !error && (
        <div className="mt-6 space-y-3">
          {courses.length === 0 ? (
            <p className="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-600">
              Bạn chưa mua khóa học nào.
            </p>
          ) : (
            courses.map((course) => (
              <article key={course.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <h2 className="text-base font-semibold text-slate-900">{course.title}</h2>
                <p className="mt-1 text-sm text-slate-600">{course.description || 'Không có mô tả'}</p>
                <p className="mt-2 text-sm font-medium text-emerald-700">Giá: {course.price.toLocaleString('vi-VN')} VND</p>
                <p className="mt-1 text-xs text-slate-500">Mua lúc: {new Date(course.enrolledAt).toLocaleString('vi-VN')}</p>
              </article>
            ))
          )}
        </div>
      )}
    </main>
  );
}
