import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || 'http://localhost:8000/api',
});

export async function fetchArticles() {
  const { data: response } = await api.get('/articles', { params: { per_page: 50 } });
  return response.data || response; // extract articles array from paginated response
}

export default api;
