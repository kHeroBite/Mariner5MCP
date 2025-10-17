import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const timeout = Number(process.env.HTTP_TIMEOUT || 60000);

export const http = axios.create({ timeout });

http.interceptors.request.use(cfg => {
  const token = process.env.API_TOKEN;
  if (token) cfg.headers = { ...(cfg.headers||{}), Authorization: `Bearer ${token}` };
  return cfg;
});

http.interceptors.response.use(
  r => r,
  async (err) => {
    const s = err.response?.status;
    if (s && [429, 502, 503, 504].includes(s)) {
      await new Promise(res => setTimeout(res, 1000));
    }
    throw err;
  }
);
