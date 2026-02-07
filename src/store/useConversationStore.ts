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

  // 发送消息
  sendMessage: async (conversationId, content) => {
    // 创建临时用户消息，立即显示在UI上
    const tempUserMessage: Message = {
      id: Date.now(), // 使用时间戳作为临时ID
      conversation_id: conversationId,
      content,
      role: 'user',
      create_time: new Date().toISOString(),
    };
    
    // 立即将用户消息添加到列表中
    set((state) => ({
      messages: [...state.messages, tempUserMessage],
    }));
    try {
      await qaApi.sendMessage({
        conversation_id: conversationId,
        content,
      });

      // 重新获取消息列表，确保包含用户的提问和AI的回复
      await get().fetchMessages(conversationId);
    } catch (error) {
      set((state) => ({
        messages: state.messages.filter(msg => msg.id !== tempUserMessage.id),
        messagesError: error instanceof Error ? error.message : '发送消息失败',
      }));
    }
  },

  clearMessagesError: () => {
    set({ messagesError: null });
  },
}));
