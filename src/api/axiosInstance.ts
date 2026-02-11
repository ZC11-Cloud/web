import axios from 'axios';
import { message } from 'antd';
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

//请求拦截器
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

//响应拦截器
axiosInstance.interceptors.response.use(
  (response) => {
    console.log('response', response);
    if (
      response.config.url?.includes('/user/login') &&
      response.status === 200
    ) {
      const token = response.data.access_token;
      localStorage.setItem('token', token);
      axiosInstance.defaults.headers.common['Authorization'] =
        `Bearer ${token}`;
    }
    return response.data;
  },
  (error) => {
    // 统一错误处理
    if (error.response) {
      switch (error.response.status) {
        case 400:
          message.error(error.response.data.message || '请求参数错误');
          break;
        case 401:
          message.error('未授权，请重新登录');
          // 清除token并重定向到登录页
          localStorage.removeItem('token');
          delete axiosInstance.defaults.headers.common['Authorization'];
          // 导航到登录页（注意：在拦截器中无法直接使用useNavigate，需要特殊处理）
          window.location.href = '/login';
          break;
        case 403:
          message.error('权限不足');
          break;
        case 404:
          message.error('请求资源不存在');
          break;
        case 500:
          message.error('服务器错误');
          break;
        default:
          message.error(error.response.data.message || '请求失败');
      }
    } else if (error.request) {
      message.error('网络异常，请检查网络连接');
    } else {
      message.error('请求失败');
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
