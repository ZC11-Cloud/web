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
  use_rag?: boolean;
  use_image?: boolean;
  image_base64?: string | null;
}

// 流式消息 SSE 事件类型
export type StreamEventType = 'chunk' | 'done' | 'error';

export interface StreamEventChunk {
  type: 'chunk';
  content: string;
}

export interface StreamEventDone {
  type: 'done';
}

export interface StreamEventError {
  type: 'error';
  detail: string;
}

export type StreamEvent = StreamEventChunk | StreamEventDone | StreamEventError;

// 流式发送消息的选项
export interface SendMessageStreamOptions {
  use_rag?: boolean;
  use_image?: boolean;
  image_base64?: string | null;
  onChunk: (content: string) => void;
  onDone?: () => void;
  onError?: (detail: string) => void;
  signal?: AbortSignal;
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
        use_rag: data.use_rag,
        use_image: data.use_image,
        image_base64: data.image_base64 ?? undefined,
      }
    );
  },

  /**
   * 流式发送消息：POST 到 stream 接口，解析 SSE 并回调 onChunk / onDone / onError。
   * 使用 fetch 以便读取流式 body，需自行携带 token（与 axiosInstance 一致）。
   */
  sendMessageStream: async (
    conversationId: number,
    content: string,
    options: SendMessageStreamOptions
  ): Promise<void> => {
    const { use_rag, use_image, image_base64, onChunk, onDone, onError, signal } = options;
    const baseURL = import.meta.env.VITE_API_BASE_URL ?? '';
    const url = `${baseURL.replace(/\/$/, '')}/qa/conversations/${conversationId}/messages/stream`;
    const token = localStorage.getItem('token');

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: (() => {
        const body = {
          content,
          use_rag: use_rag ?? false,
          use_image: use_image ?? false,
          image_base64: image_base64 ?? undefined,
        };
        console.log('[DEBUG] qaApi.sendMessageStream 请求体:', {
          use_rag: body.use_rag,
          use_image: body.use_image,
          image_base64: body.image_base64 ? `${body.image_base64.length} 字符` : '未传',
        });
        return JSON.stringify(body);
      })(),
      signal,
    });

    if (!response.ok) {
      const detail =
        (await response.json().catch(() => ({}))).detail ?? response.statusText;
      options.onError?.(detail);
      return;
    }

    const reader = response.body?.getReader();
    if (!reader) {
      options.onError?.('无响应体');
      return;
    }

    const decoder = new TextDecoder();
    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const raw = line.slice(6).trim();
          if (raw === '') continue;
          try {
            const event = JSON.parse(raw) as StreamEvent;
            if (event.type === 'chunk') {
              onChunk(event.content);
            } else if (event.type === 'done') {
              onDone?.();
            } else if (event.type === 'error') {
              onError?.(event.detail);
            }
          } catch {
            // 忽略单行解析失败
          }
        }
      }
      // 剩余 buffer 再解析一行
      if (buffer.startsWith('data: ')) {
        const raw = buffer.slice(6).trim();
        if (raw) {
          try {
            const event = JSON.parse(raw) as StreamEvent;
            if (event.type === 'chunk') onChunk(event.content);
            else if (event.type === 'done') onDone?.();
            else if (event.type === 'error') onError?.(event.detail);
          } catch {
            // ignore
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  },
};

export default qaApi;
