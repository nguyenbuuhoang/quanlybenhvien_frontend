class TokenManager {
  private refreshPromise: Promise<boolean> | null = null;

  // Hàm decode JWT token để lấy thông tin expiry
  private parseJWT(token: string) {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(function (c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
          })
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      return null;
    }
  }

  // Kiểm tra token có hết hạn không
  private isTokenExpired(token: string): boolean {
    const decoded = this.parseJWT(token);
    if (!decoded || !decoded.exp) return true;
    
    const currentTime = Date.now() / 1000;
    // Thêm buffer 30 giây để refresh trước khi hết hạn
    return decoded.exp - 30 < currentTime;
  }

  // Refresh token
  public async refreshToken(): Promise<boolean> {
    // Chờ request hoàn thành nếu đang có một refresh request, 
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    this.refreshPromise = this.performRefresh();
    const result = await this.refreshPromise;
    this.refreshPromise = null;
    return result;
  }

  private async performRefresh(): Promise<boolean> {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) return false;

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          localStorage.setItem('accessToken', data.data.accessToken);
          localStorage.setItem('refreshToken', data.data.refreshToken);
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('Error refreshing token:', error);
      return false;
    }
  }

  // Kiểm tra và refresh token nếu cần
  public async ensureValidToken(): Promise<boolean> {
    if (typeof window === 'undefined') return false;

    const token = localStorage.getItem('accessToken');
    if (!token) return false;

    if (this.isTokenExpired(token)) {
      return await this.refreshToken();
    }

    return true;
  }

  // Auto refresh token khi app start
  public initAutoRefresh() {
    if (typeof window === 'undefined') return;

    // Kiểm tra ngay khi init, chỉ refresh nếu cần
    this.ensureValidToken();

    // Thiết lập interval để kiểm tra định kỳ mỗi 5 phút
    setInterval(() => {
      this.ensureValidToken();
    }, 5 * 60 * 1000);
  }
}

export const tokenManager = new TokenManager();
