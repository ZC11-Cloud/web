import { create } from 'zustand';
import qaApi from '../api/qaApi';
import type {
  Conversation,
  ConversationsParams,
  MessagesParams,
  Message,
} from '../api/qaApi';

interface ConversationStore {
  conversations: Conversation[];
  currentConversationId: number | null;
  loading: boolean;
  error: string | null;
  total: number;
  // 消息相关状态
  messages: Message[];
  messagesLoading: boolean;
  messagesError: string | null;
  messagesTotal: number;
  /** 当前正在流式接收的 AI 回复内容 */
  streamingContent: string;
  /** 是否处于流式输出中 */
  isStreaming: boolean;
  // Actions
  fetchConversations: (params?: ConversationsParams) => Promise<void>;
  setCurrentConversation: (id: number | null) => void;
  clearError: () => void;
  deleteConversation: (conversationId: number) => Promise<void>;

  // 消息相关操作
  fetchMessages: (
    conversationId: number,
    params?: Omit<MessagesParams, 'conversation_id'>
  ) => Promise<void>;
  sendMessage: (conversationId: number, content: string) => Promise<void>;
  clearMessagesError: () => void;
}

export const useConversationStore = create<ConversationStore>((set, get) => ({
  conversations: [],
  currentConversationId: null,
  loading: false,
  error: null,
  total: 0,
  // 消息相关状态
  messages: [],
  messagesLoading: false,
  messagesError: null,
  messagesTotal: 0,
  streamingContent: '',
  isStreaming: false,

  fetchConversations: async (params = { skip: 0, limit: 20 }) => {
    set({ loading: true, error: null });

    try {
      const response = await qaApi.getConversations(params);
      set({
        conversations: response.conversations,
        total: response.total,
        loading: false,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : '获取会话列表失败',
        loading: false,
      });
    }
  },

  setCurrentConversation: (id) => {
    set({ currentConversationId: id, messages: [] });

    // 如果设置了会话ID，则自动获取该会话的消息
    if (id !== null) {
      get().fetchMessages(id);
    }
  },

  clearError: () => {
    set({ error: null });
  },

  deleteConversation: async (conversationId) => {
    try {
      await qaApi.deleteConversation(conversationId);
      set((state) => ({
        conversations: state.conversations.filter(
          (conv) => conv.id !== conversationId
        ),
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : '删除会话失败',
      });
    }
  },

  // 获取消息列表
  fetchMessages: async (conversationId, params = { skip: 0, limit: 50 }) => {
    set({ messagesLoading: true, messagesError: null });

    try {
      const response = await qaApi.getMessages({
        conversation_id: conversationId,
        ...params,
      });

      set({
        messages: response.messages,
        messagesTotal: response.total,
        messagesLoading: false,
      });
    } catch (error) {
      set({
        messagesError:
          error instanceof Error ? error.message : '获取消息列表失败',
        messagesLoading: false,
      });
    }
  },

  // 发送消息（流式输出）
  sendMessage: async (conversationId, content) => {
    const tempUserMessage: Message = {
      id: Date.now(),
      conversation_id: conversationId,
      content,
      role: 'user',
      create_time: new Date().toISOString(),
    };

    set((state) => ({
      messages: [...state.messages, tempUserMessage],
      isStreaming: true,
      streamingContent: '',
      messagesError: null,
    }));

    try {
      await qaApi.sendMessageStream(conversationId, content, {
        onChunk: (chunk) => {
          console.log('[stream] chunk', chunk.length, chunk);
          set((state) => ({ streamingContent: state.streamingContent + chunk }));
        },
        onDone: async () => {
          set({ isStreaming: false, streamingContent: '' });
          await get().fetchMessages(conversationId);
        },
        onError: (detail) => {
          set({
            isStreaming: false,
            streamingContent: '',
            messagesError: detail,
          });
        },
      });
    } catch (error) {
      set((state) => ({
        messages: state.messages.filter((msg) => msg.id !== tempUserMessage.id),
        isStreaming: false,
        streamingContent: '',
        messagesError: error instanceof Error ? error.message : '发送消息失败',
      }));
    }
  },

  clearMessagesError: () => {
    set({ messagesError: null });
  },
}));
