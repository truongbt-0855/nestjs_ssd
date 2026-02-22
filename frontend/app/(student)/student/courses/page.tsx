'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { apiGet, apiPost } from '../../../../lib/api-client';

interface CourseItem {
  id: string;
  title: string;
  description?: string;
  price: number;
  published: boolean;
  createdAt: string;
}

interface CursorPage<T> {
  data: T[];
  nextCursor: string | null;
}

interface LoginResponse {
  accessToken: string;
  tokenType: string;
}

interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  role: 'ADMIN' | 'INSTRUCTOR' | 'STUDENT';
  balance: string;
}

interface PurchasedCourseItem {
  id: string;
  title: string;
  description?: string;
  price: number;
  enrolledAt: string;
}

export default function StudentCoursesPage() {
  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [walletBalance, setWalletBalance] = useState<string | null>(null);
  const [ownedCourseIds, setOwnedCourseIds] = useState<string[]>([]);
  const [buyingCourseId, setBuyingCourseId] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCourses = async (token: string): Promise<void> => {
    const result = await apiGet<CursorPage<CourseItem>>('/courses?limit=10', token);
    setCourses(result.data);
  };

  const loadProfile = async (token: string): Promise<void> => {
    const profile = await apiGet<UserProfile>('/users/me', token);
    setWalletBalance(profile.balance);
  };

  const loadPurchasedCourses = async (token: string): Promise<void> => {
    const purchased = await apiGet<PurchasedCourseItem[]>('/users/my-courses', token);
    setOwnedCourseIds(purchased.map((course) => course.id));
  };

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);

        const login = await apiPost<LoginResponse, { email: string; password: string }>('/auth/login', {
          email: 'student@nestlearn.local',
          password: 'Student@123',
        });

        setAccessToken(login.accessToken);
        await loadCourses(login.accessToken);
        await loadProfile(login.accessToken);
        await loadPurchasedCourses(login.accessToken);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Không thể tải dữ liệu khóa học');
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, []);

  const handlePurchase = async (courseId: string) => {
    if (!accessToken) {
      setError('Chưa có token đăng nhập student');
      return;
    }

    try {
      setBuyingCourseId(courseId);
      setError(null);
      setNotice(null);

      const response = await apiPost<{ success: boolean; message: string }, { courseId: string }>(
        '/orders/purchase',
        { courseId },
        accessToken,
      );

      setNotice(response.message);
      await loadProfile(accessToken);
      await loadPurchasedCourses(accessToken);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể mua khóa học');
    } finally {
      setBuyingCourseId(null);
    }
  };

  return (
    <main className="mx-auto max-w-3xl p-6 md:p-10">
      <h1 className="text-2xl font-bold text-slate-900">Mua khóa học</h1>
      <p className="mt-2 text-sm text-slate-600">Danh sách lấy trực tiếp từ API backend bằng tài khoản Student seed.</p>
      <p className="mt-2 text-sm">
        <Link href="/student/my-courses" className="text-blue-600 underline">
          Xem danh sách khóa học đã mua
        </Link>
      </p>

      <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
        <p className="text-sm text-emerald-800">Số dư ví hiện tại</p>
        <p className="mt-1 text-2xl font-bold text-emerald-700">{walletBalance ?? '...'} USD</p>
      </div>

      {loading && <p className="mt-4 text-sm text-slate-500">Đang tải dữ liệu từ API...</p>}
      {error && <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">Lỗi: {error}</p>}
      {notice && <p className="mt-4 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700">{notice}</p>}

      {!loading && !error && (
        <div className="mt-6 space-y-3">
          {courses.length === 0 ? (
            <p className="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-600">
              Chưa có khóa học nào trong danh sách.
            </p>
          ) : (
            courses.map((course) => (
              <article key={course.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <h2 className="text-base font-semibold text-slate-900">{course.title}</h2>
                <p className="mt-1 text-sm text-slate-600">{course.description || 'Không có mô tả'}</p>
                <p className="mt-2 text-sm font-medium text-emerald-700">Giá: {course.price.toLocaleString('vi-VN')} VND</p>
                {ownedCourseIds.includes(course.id) ? (
                  <div className="mt-3 inline-flex rounded-lg bg-emerald-100 px-3 py-1.5 text-sm font-medium text-emerald-700">
                    Đã mua
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => void handlePurchase(course.id)}
                    disabled={buyingCourseId === course.id}
                    className="mt-3 inline-flex rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white disabled:opacity-60"
                  >
                    {buyingCourseId === course.id ? 'Đang mua...' : 'Mua khóa học'}
                  </button>
                )}
              </article>
            ))
          )}
        </div>
      )}
    </main>
  );
}
