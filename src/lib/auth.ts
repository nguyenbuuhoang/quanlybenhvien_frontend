export function isAuthenticated(): boolean {
  if (typeof window === 'undefined') return false;
  
  try {
    const token = localStorage.getItem('accessToken');
    if (!token) return false;

    // Kiểm tra nếu token đã hết hạn
    return !!token;
  } catch (error) {
    console.error('Error checking authentication:', error);
    return false;
  }
}

export function logout(redirectPath: string = '/') {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    window.location.href = redirectPath;
  }
}
