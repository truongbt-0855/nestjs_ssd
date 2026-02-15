import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export interface Course {
  id: string;
  title: string;
  description?: string;
  status: 'DRAFT' | 'PUBLISHED';
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCourseDto {
  title: string;
  description?: string;
}

export interface UpdateCourseDto {
  title?: string;
  description?: string;
}

export interface ApiResponse<T> {
  data: T;
  message: string;
}

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token interceptor
api.interceptors.request.use((config: any) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const courseService = {
  async getAll(): Promise<Course[]> {
    const response = await api.get<ApiResponse<Course[]>>('/courses');
    return response.data.data;
  },

  async getById(id: string): Promise<Course> {
    const response = await api.get<ApiResponse<Course>>(`/courses/${id}`);
    return response.data.data;
  },

  async create(data: CreateCourseDto): Promise<Course> {
    const response = await api.post<ApiResponse<Course>>('/courses', data);
    return response.data.data;
  },

  async update(id: string, data: UpdateCourseDto): Promise<Course> {
    const response = await api.put<ApiResponse<Course>>(`/courses/${id}`, data);
    return response.data.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/courses/${id}`);
  },
};
