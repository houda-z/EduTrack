import api from './api';

export const login = async (credentials) => {
  const response = await api.post('/login', credentials);
  if (response.data && response.data.token) {
    localStorage.setItem('user_token', response.data.token);
    // Optionally store user details as well if returned
    if (response.data.user) {
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
  }
  return response.data;
};

export const logout = async () => {
  try {
    await api.post('/logout'); // Try to log out from backend too
  } catch (error) {
    console.error("Logout API call failed", error);
  } finally {
    localStorage.removeItem('user_token');
    localStorage.removeItem('user');
  }
};