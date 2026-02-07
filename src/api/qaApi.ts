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

// 创建会话请求接口
export interface CreateConversationRequest {
  title: string;
}

// 消息接口
export interface Message {
  id: number;
  conversation_id: number;
  content: string;
  role: 'user' | 'assistant';
  create_time: string;
}

// 获取消息列表参数接口
export interface MessagesParams {
  conversation_id: number;
  skip: number;
  limit: number;
}

// 消息列表响应接口
export interface MessagesResponse {
  messages: Message[];
  total: number;
}

// 发送消息请求接口
export interface SendMessageRequest {
  conversation_id: number;
  content: string;
}

const qaApi = {
  // 获取会话
  getConversations: (
    params: ConversationsParams
  ): Promise<ConversationsResponse> => {
    return axiosInstance.get('/qa/conversations', { params });
  },

  // 新增会话
  createConversation: (
    data: CreateConversationRequest
  ): Promise<Conversation> => {
    return axiosInstance.post('/qa/conversations', data);
  },
  // 删除会话
  deleteConversation: (conversation_id: number): Promise<void> => {
    return axiosInstance.delete(`/qa/conversations/${conversation_id}`);
  },
  // 获取消息
  getMessages: (params: MessagesParams): Promise<MessagesResponse> => {
    return axiosInstance.get(
      `/qa/conversations/${params.conversation_id}/messages`,
      {
        params: {
          skip: params.skip,
          limit: params.limit,
        },
      }
    );
  },

  // 新增消息
  sendMessage: (data: SendMessageRequest): Promise<Message> => {
    return axiosInstance.post(
      `/qa/conversations/${data.conversation_id}/messages`,
      {
        content: data.content,
      }
    );
  },
};

export default qaApi;
