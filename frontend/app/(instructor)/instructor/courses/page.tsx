'use client';

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

export default function InstructorCoursesPage() {
  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('199000');
  const [publishNow, setPublishNow] = useState(true);
  const [creating, setCreating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCourses = async (token: string): Promise<void> => {
    const result = await apiGet<CursorPage<CourseItem>>('/courses?limit=10', token);
    setCourses(result.data);
  };

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);

        const login = await apiPost<LoginResponse, { email: string; password: string }>('/auth/login', {
          email: 'instructor@nestlearn.local',
          password: 'Instructor@123',
        });

        setAccessToken(login.accessToken);
        await loadCourses(login.accessToken);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Không thể tải dữ liệu khóa học');
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, []);

  const handleCreateCourse = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!accessToken) {
      setError('Chưa có token đăng nhập instructor');
      return;
    }

    const trimmedTitle = title.trim();
    const trimmedDescription = description.trim();
    const numericPrice = Number(price);

    if (trimmedTitle.length < 3) {
      setError('Tên khóa học phải từ 3 ký tự');
      return;
    }

    if (!Number.isFinite(numericPrice) || numericPrice < 0) {
      setError('Giá khóa học không hợp lệ');
      return;
    }

    try {
      setCreating(true);
      setError(null);

      await apiPost<CourseItem, { title: string; description?: string; price: number; published?: boolean }>(
        '/courses',
        {
          title: trimmedTitle,
          ...(trimmedDescription ? { description: trimmedDescription } : {}),
          price: numericPrice,
          published: publishNow,
        },
        accessToken,
      );

      await loadCourses(accessToken);
      setTitle('');
      setDescription('');
      setPrice('199000');
      setPublishNow(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể tạo khóa học');
    } finally {
      setCreating(false);
    }
  };

  return (
    <main className="mx-auto max-w-3xl p-6 md:p-10">
      <h1 className="text-2xl font-bold text-slate-900">Quản lý khóa học</h1>
      <p className="mt-2 text-sm text-slate-600">Danh sách lấy trực tiếp từ API backend bằng tài khoản Instructor seed.</p>

      <form onSubmit={handleCreateCourse} className="mt-4 space-y-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-900">Tạo khóa học mới</h2>
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Tên khóa học"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
        />
        <textarea
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="Mô tả (tuỳ chọn)"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
          rows={3}
        />
        <input
          type="number"
          min={0}
          step={1000}
          value={price}
          onChange={(event) => setPrice(event.target.value)}
          placeholder="Giá khóa học"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
        />
        <label className="inline-flex items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={publishNow}
            onChange={(event) => setPublishNow(event.target.checked)}
          />
          Xuất bản ngay sau khi tạo
        </label>
        <button
          type="submit"
          disabled={creating || loading}
          className="inline-flex rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
        >
          {creating ? 'Đang tạo...' : 'Tạo khóa học'}
        </button>
      </form>

      {loading && <p className="mt-4 text-sm text-slate-500">Đang tải dữ liệu từ API...</p>}
      {error && <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">Lỗi: {error}</p>}

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
              </article>
            ))
          )}
        </div>
      )}
    </main>
  );
}
