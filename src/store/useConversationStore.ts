import { create } from 'zustand';
import qaApi from '../api/qaApi';
import type { Conversation, ConversationsParams } from '../api/qaApi';

interface ConversationStore {
  conversations: Conversation[];
  currentConversationId: number | null;
  loading: boolean;
  error: string | null;
  total: number;
  
  // Actions
  fetchConversations: (params?: ConversationsParams) => Promise<void>;
  setCurrentConversation: (id: number | null) => void;
  clearError: () => void;
}

export const useConversationStore = create<ConversationStore>((set, get) => ({
  conversations: [],
  currentConversationId: null,
  loading: false,
  error: null,
  total: 0,
  
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
    set({ currentConversationId: id });
  },
  
  clearError: () => {
    set({ error: null });
  },
}));
