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
  role: UserRole;
  status: UserStatus;
  avatar_url?: string;
}

export type UserRole = 0 | 1;
export type UserStatus = 0 | 1;

export interface AdminUserItem extends UserInfo {
  create_time: string;
  update_time: string;
}

export interface AdminUserListData {
  items: AdminUserItem[];
  total: number;
  page: number;
  page_size: number;
}

export interface AdminUserListParams {
  page: number;
  page_size: number;
  keyword?: string;
}

export interface AdminCreateUserParams {
  username: string;
  password: string;
  real_name?: string;
  phone?: string;
  email?: string;
  role: UserRole;
  status: UserStatus;
}

export interface AdminUpdateUserParams {
  real_name?: string;
  phone?: string;
  email?: string;
}

export interface AdminUpdateUserStatusParams {
  status: UserStatus;
}

export interface AdminUpdateUserRoleParams {
  role: UserRole;
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
    return axiosInstance.put('/user/me', params);
  },

  // 上传用户头像
  uploadAvatar: (avatarFile: File): Promise<ApiResponse<string>> => {
    const formData = new FormData();
    formData.append('file', avatarFile);
    return axiosInstance.post('/user/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // 获取用户头像
  getAvatar: (userId: number): Promise<Blob> => {
    return axiosInstance.get(`/user/avatar/${userId}`, {
      responseType: 'blob',
    });
  },

  // 管理员分页查询用户列表
  listAdminUsers: (
    params: AdminUserListParams
  ): Promise<ApiResponse<AdminUserListData>> => {
    return axiosInstance.get('/user/admin/list', { params });
  },

  // 管理员获取用户详情
  getAdminUserById: (userId: number): Promise<ApiResponse<AdminUserItem>> => {
    return axiosInstance.get(`/user/admin/${userId}`);
  },

  // 管理员新增用户
  createAdminUser: (
    params: AdminCreateUserParams
  ): Promise<ApiResponse<null>> => {
    return axiosInstance.post('/user/admin', params);
  },

  // 管理员更新用户基础资料
  updateAdminUser: (
    userId: number,
    params: AdminUpdateUserParams
  ): Promise<ApiResponse<AdminUserItem>> => {
    return axiosInstance.put(`/user/admin/${userId}`, params);
  },

  // 管理员更新用户状态
  updateAdminUserStatus: (
    userId: number,
    params: AdminUpdateUserStatusParams
  ): Promise<ApiResponse<AdminUserItem>> => {
    return axiosInstance.patch(`/user/admin/${userId}/status`, params);
  },

  // 管理员更新用户角色
  updateAdminUserRole: (
    userId: number,
    params: AdminUpdateUserRoleParams
  ): Promise<ApiResponse<AdminUserItem>> => {
    return axiosInstance.patch(`/user/admin/${userId}/role`, params);
  },

  // 管理员删除用户
  deleteAdminUser: (userId: number): Promise<ApiResponse<null>> => {
    return axiosInstance.delete(`/user/admin/${userId}`);
  },
};

export default userApi;
