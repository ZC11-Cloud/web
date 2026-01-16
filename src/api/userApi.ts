import axiosInstance from './axiosInstance';

// 用户注册请求参数接口
export interface RegisterParams {
  username: string;
  password: string;
  real_name?: string;
  phone?: string;
  email?: string;
}

// 用户登录请求参数接口
export interface LoginParams {
  username: string;
  password: string;
}

// 登录响应接口
export interface LoginResponse {
  access_token: string;
  token_type: string;
}

// 用户信息接口
export interface UserInfo {
  id: number;
  username: string;
  real_name?: string;
  phone?: string;
  email?: string;
  role: number;
  status: number;
}

// 通用响应接口
export interface ApiResponse<T> {
  result: 'success' | 'failure';
  code: number;
  message: string;
  data: T;
  meta: T;
}
// 更新用户信息
export interface UpdateUserParams {
  real_name?: string;
  phone?: string;
  email?: string;
}

// 用户API服务
const userApi = {
  // 用户注册
  register: (params: RegisterParams): Promise<ApiResponse<null>> => {
    return axiosInstance.post('/user/register', params);
  },

  // 用户登录
  login: (params: LoginParams): Promise<LoginResponse> => {
    const formData = new URLSearchParams();
    formData.append('username', params.username);
    formData.append('password', params.password);
    return axiosInstance.post('/user/login', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
  },

  // 获取当前用户信息
  getCurrentUser: (): Promise<ApiResponse<UserInfo>> => {
    return axiosInstance.get('/user/me');
  },

  // 更新用户信息
  updateUserInfo: (
    params: UpdateUserParams
  ): Promise<ApiResponse<UserInfo>> => {
    return axiosInstance.put('/user/update', params);
  },
};

export default userApi;
