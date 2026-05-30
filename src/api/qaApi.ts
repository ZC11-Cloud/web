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

// 知识库引用，供 Sources 组件溯源
export interface KnowledgeCitation {
  key: number;
  source_id: string;
  filename: string;
  snippet: string;
}

// 消息接口
export interface QaAttachment {
  file_id: string;
  original_filename: string;
  file_ext?: string | null;
  size?: number | null;
}

export interface Message {
  id: number;
  conversation_id: number;
  content: string;
  role: 'user' | 'assistant';
  create_time: string;
  /** 用户消息附带图片时的访问 URL（本地存储或后期 OSS），历史记录中用于在气泡上方展示 */
  image_url?: string | null;
  attachments?: QaAttachment[] | null;
  /** AI 回复引用的知识库来源，供 Sources 上标溯源 */
  citations?: KnowledgeCitation[] | null;
  /** AI 思考过程（深度思考模型可选） */
  reasoning_content?: string | null;
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

export interface SuggestionsResponse {
  suggestions: string[];
}

// 发送消息请求接口
export interface SendMessageRequest {
  conversation_id: number;
  content: string;
  use_rag?: boolean;
  use_image?: boolean;
  image_base64?: string | null;
  attachments?: QaAttachment[];
  /** 可选：指定后端使用的模型名称 */
  model_name?: string;
  /** 是否启用深度思考 */
  enable_thinking?: boolean;
  /** 思考预算（最大推理 Token） */
  thinking_budget?: number;
  /** 是否传递历史思考过程 */
  preserve_thinking?: boolean;
}

// 流式消息 SSE 事件类型
export type StreamTraceStage =
  | 'prepare'
  | 'rag'
  | 'image'
  | 'agent'
  | 'model'
  | 'done';

export type StreamTraceStatus = 'pending' | 'running' | 'success' | 'error';

export interface StreamTraceEvent {
  type: 'trace';
  stage: StreamTraceStage;
  status: StreamTraceStatus;
  title: string;
  detail?: string;
}

export type StreamEventType =
  | 'chunk'
  | 'reasoning_chunk'
  | 'trace'
  | 'done'
  | 'error';

export interface StreamEventChunk {
  type: 'chunk';
  content: string;
}

export interface StreamEventDone {
  type: 'done';
  citations?: KnowledgeCitation[];
}

export interface StreamEventReasoningChunk {
  type: 'reasoning_chunk';
  content: string;
}

export interface StreamEventError {
  type: 'error';
  detail: string;
}

export type StreamEvent =
  | StreamEventChunk
  | StreamEventReasoningChunk
  | StreamTraceEvent
  | StreamEventDone
  | StreamEventError;

// 流式发送消息的选项
export interface SendMessageStreamOptions {
  use_rag?: boolean;
  use_image?: boolean;
  image_base64?: string | null;
  attachments?: QaAttachment[];
  /** 可选：指定后端使用的模型名称 */
  model_name?: string;
  /** 是否启用深度思考 */
  enable_thinking?: boolean;
  /** 思考预算（最大推理 Token） */
  thinking_budget?: number;
  /** 是否传递历史思考过程 */
  preserve_thinking?: boolean;
  onChunk: (content: string) => void;
  onReasoningChunk?: (content: string) => void;
  onTrace?: (event: StreamTraceEvent) => void;
  onDone?: (citations?: KnowledgeCitation[]) => void;
  onError?: (detail: string) => void;
  signal?: AbortSignal;
}

export interface SuggestionParams {
  message_id?: number;
  limit?: number;
}

const qaApi = {
  uploadAttachment: (file: File): Promise<QaAttachment> => {
    const formData = new FormData();
    formData.append('file', file);
    return axiosInstance.post('/qa/attachments', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

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

  // 根据首轮对话内容生成并更新会话标题
  generateConversationTitle: (
    conversationId: number
  ): Promise<{ title: string }> => {
    return axiosInstance.post(
      `/qa/conversations/${conversationId}/generate-title`
    );
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

  // 获取建议追问
  getSuggestions: (
    conversationId: number,
    params: SuggestionParams = {}
  ): Promise<SuggestionsResponse> => {
    return axiosInstance.get(`/qa/conversations/${conversationId}/suggestions`, {
      params: {
        message_id: params.message_id,
        limit: params.limit ?? 3,
      },
    });
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
        attachments: data.attachments,
        model_name: data.model_name,
        enable_thinking: data.enable_thinking,
        thinking_budget: data.thinking_budget,
        preserve_thinking: data.preserve_thinking,
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
    const {
      use_rag,
      use_image,
      image_base64,
      attachments,
      model_name,
      onChunk,
      onDone,
      onError,
      signal,
    } = options;
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
          attachments,
          model_name,
          enable_thinking: options.enable_thinking,
          thinking_budget: options.thinking_budget,
          preserve_thinking: options.preserve_thinking,
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
    const handleEvent = (event: StreamEvent) => {
      if (event.type === 'chunk') {
        onChunk(event.content);
      } else if (event.type === 'reasoning_chunk') {
        options.onReasoningChunk?.(event.content);
      } else if (event.type === 'trace') {
        options.onTrace?.(event);
      } else if (event.type === 'done') {
        onDone?.(event.citations);
      } else if (event.type === 'error') {
        onError?.(event.detail);
      }
    };

    const parseDataLine = (line: string) => {
      const normalized = line.trimEnd();
      if (!normalized.startsWith('data: ')) return;
      const raw = normalized.slice(6).trim();
      if (raw === '') return;
      try {
        handleEvent(JSON.parse(raw) as StreamEvent);
      } catch {
        // 忽略单行解析失败
      }
    };

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          buffer += decoder.decode();
          break;
        }
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';

        for (const line of lines) {
          parseDataLine(line);
        }
      }
      // 剩余 buffer 可能包含一条或多条尚未处理的 data 行
      if (buffer) {
        buffer.split('\n').forEach(parseDataLine);
      }
    } finally {
      reader.releaseLock();
    }
  },
};

export default qaApi;
