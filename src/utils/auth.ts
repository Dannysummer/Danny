/**
 * 从cookie中获取用户token
 * @returns 用户token字符串，未找到则返回null
 */
export function getTokenFromCookie(): string | null {
  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === 'token') {
      return value;
    }
  }
  return null;
}

/**
 * 检查用户是否已登录
 * @returns 用户是否已登录
 */
export function isLoggedIn(): boolean {
  // 首先检查 cookie
  const cookieToken = getTokenFromCookie();
  
  // 如果 cookie 中找到 token，直接返回 true
  if (cookieToken !== null) {
    return true;
  }
  
  // 如果 cookie 中没有找到，检查 localStorage
  const isLoggedInLocalStorage = localStorage.getItem('isLoggedIn') === 'true';
  const userInfoInLocalStorage = localStorage.getItem('userInfo');
  
  // 如果 localStorage 中有登录标记并且有用户信息，也认为已登录
  if (isLoggedInLocalStorage && userInfoInLocalStorage) {
    console.log('通过localStorage检测到登录状态');
    return true;
  }
  
  console.log('未检测到登录状态');
  return false;
}

/**
 * 获取带有认证信息的请求头对象
 * @returns 包含认证token的请求头对象
 */
export function getAuthHeaders(): Record<string, string> {
  const token = getTokenFromCookie();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
} 