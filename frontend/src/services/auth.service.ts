import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'INSTRUCTOR' | 'STUDENT';
}

export interface AuthResponse {
  access_token: string;
  user: User;
}

class AuthService {
  private tokenKey = 'access_token';
  private userKey = 'current_user';

  /**
   * Đăng nhập với email/password
   */
  async login(email: string, password: string): Promise<AuthResponse> {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, {
        email,
        password,
      });

      const { data } = response.data;

      // Lưu token và user vào localStorage
      localStorage.setItem(this.tokenKey, data.access_token);
      localStorage.setItem(this.userKey, JSON.stringify(data.user));

      return data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Đăng nhập thất bại');
    }
  }

  /**
   * Đăng xuất
   */
  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
  }

  /**
   * Lấy JWT token từ localStorage
   */
  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  /**
   * Lấy thông tin user hiện tại
   */
  getCurrentUser(): User | null {
    const user = localStorage.getItem(this.userKey);
    return user ? JSON.parse(user) : null;
  }

  /**
   * Kiểm tra người dùng đã đưa nhập hay chưa
   */
  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  /**
   * Kiểm tra người dùng là giảng viên
   */
  isInstructor(): boolean {
    const user = this.getCurrentUser();
    return user?.role === 'INSTRUCTOR';
  }
}

export default new AuthService();
