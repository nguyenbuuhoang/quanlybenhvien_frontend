import { tokenManager } from './tokenManager';

export async function isAuthenticated(): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  
  try {
    return await tokenManager.ensureValidToken();
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
