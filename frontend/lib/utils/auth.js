// Helper utility untuk redirect berdasarkan role
export const redirectByRole = (role) => {
  console.log('Redirecting user with role:', role);
  
  const roleRoutes = {
    'admin': '/pengelola',
    'pengelola': '/pengelola',
    'visitor': '/',
  };
  
  const targetUrl = roleRoutes[role?.toLowerCase()] || '/';
  console.log('Target URL:', targetUrl);
  
  return targetUrl;
};

// Helper untuk mendapatkan user dari cookies
export const getUserFromCookies = () => {
  if (typeof window === 'undefined') return null;
  
  try {
    const userStr = document.cookie
      .split('; ')
      .find(row => row.startsWith('user='))
      ?.split('=')[1];
    
    if (userStr) {
      return JSON.parse(decodeURIComponent(userStr));
    }
  } catch (error) {
    console.error('Error parsing user cookie:', error);
  }
  
  return null;
};
