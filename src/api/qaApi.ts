import axiosInstance from './axiosInstance';
// 获取会话列表
export interface ConversationsParams {
  skip: number;
  limit: number;
}

// 会话列表响应接口
export interface ConversationsResponse {
  conversations: Conversation[];
  total: number;
}

// 会话接口
export interface Conversation {
  id: number;
  user_id: number;
  title: string;
  create_time: string;
  update_time: string;
}



const qaApi = {
  // 获取会话
  getConversations: (params: ConversationsParams): Promise<ConversationsResponse> => {
    return axiosInstance.get('/qa/conversations', { params });
  }
  // 新增会话
  // 获取消息
  // 新增消息
}

export default qaApi;