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
  /** 当前正在流式接收的 AI 思考内容 */
  streamingReasoningContent: string;
  /** 是否处于流式输出中 */
  isStreaming: boolean;
  streamController: AbortController | null; // 流式发送的控制器
  // Actions
  fetchConversations: (params?: ConversationsParams) => Promise<void>;
  setCurrentConversation: (
    id: number | null,
    options?: { skipFetch?: boolean }
  ) => void;
  clearError: () => void;
  deleteConversation: (conversationId: number) => Promise<void>;

  // 消息相关操作
  fetchMessages: (
    conversationId: number,
    params?: Omit<MessagesParams, 'conversation_id'>,
    options?: { silent?: boolean }
  ) => Promise<void>;
  sendMessage: (
    conversationId: number,
    content: string,
    options?: {
      use_rag?: boolean;
      use_image?: boolean;
      image_base64?: string | null;
      model_name?: string;
      enable_thinking?: boolean;
      thinking_budget?: number;
      preserve_thinking?: boolean;
    }
  ) => Promise<void>;
  clearMessagesError: () => void;
  cancelStreaming: () => Promise<void>; // 取消流式发送
  tryGenerateConversationTitle: (conversationId: number) => Promise<void>;
}

export const useConversationStore = create<ConversationStore>((set, get) => ({
  // 首轮问答（两条消息）时自动生成标题；中断流式后后端落库有延迟，做少量重试
  tryGenerateConversationTitle: async (conversationId: number) => {
    const sleep = (ms: number) =>
      new Promise<void>((resolve) => {
        setTimeout(resolve, ms);
      });

    for (let attempt = 0; attempt < 3; attempt += 1) {
      try {
        await get().fetchMessages(conversationId, undefined, { silent: true });
        const { messages, conversations } = get();
        const conv = conversations.find((c) => c.id === conversationId);
        if (
          messages.length === 2 &&
          (conv?.title === '新对话' || conv?.title?.trim() === '新对话')
        ) {
          await qaApi.generateConversationTitle(conversationId);
          await get().fetchConversations();
        }
        return;
      } catch {
        if (attempt < 2) {
          await sleep(300);
          continue;
        }
        return;
      }
    }
  },
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
  streamingReasoningContent: '',
  isStreaming: false,
  streamController: null,

  cancelStreaming: async () => {
    const {
      streamController,
      currentConversationId,
      streamingContent,
      streamingReasoningContent,
    } = get();
    const hasTruncatedContent = Boolean(streamingContent.trim());

    const truncatedMessage =
      hasTruncatedContent && currentConversationId
        ? {
            id: -Date.now(),
            conversation_id: currentConversationId,
            content: streamingContent,
            role: 'assistant' as const,
            create_time: new Date().toISOString(),
            citations: undefined,
            reasoning_content: streamingReasoningContent || undefined,
          }
        : null;

    const controller = streamController;
    if (controller) controller.abort();
    set((state) => ({
      messages: truncatedMessage
        ? [...state.messages, truncatedMessage]
        : state.messages,
      isStreaming: false,
      streamingContent: '',
      streamingReasoningContent: '',
      streamController: null,
    }));

    if (currentConversationId && hasTruncatedContent) {
      await get().tryGenerateConversationTitle(currentConversationId);
    }
  },

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

  setCurrentConversation: (id, options) => {
    set({ currentConversationId: id, messages: [] });

    // 如果设置了会话ID且未要求跳过拉取，则自动获取该会话的消息
    if (id !== null && !options?.skipFetch) {
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
  fetchMessages: async (
    conversationId,
    params = { skip: 0, limit: 50 },
    options = {}
  ) => {
    const { silent = false } = options;
    if (!silent) {
      set({ messagesLoading: true, messagesError: null });
    } else {
      set({ messagesError: null });
    }

    try {
      const response = await qaApi.getMessages({
        conversation_id: conversationId,
        ...params,
      });

      set((state) => ({
        messages: response.messages,
        messagesTotal: response.total,
        messagesLoading: silent ? state.messagesLoading : false,
      }));
    } catch (error) {
      set((state) => ({
        messagesError:
          error instanceof Error ? error.message : '获取消息列表失败',
        messagesLoading: silent ? state.messagesLoading : false,
      }));
    }
  },

  // 发送消息（流式输出）
  sendMessage: async (conversationId, content, options = {}) => {
    const {
      use_rag,
      use_image,
      image_base64,
      model_name,
      enable_thinking,
      thinking_budget,
      preserve_thinking,
    } = options;
    const tempUserMessage: Message = {
      id: Date.now(),
      conversation_id: conversationId,
      content,
      role: 'user',
      create_time: new Date().toISOString(),
    };
    const controller = new AbortController();
    set((state) => ({
      messages: [...state.messages, tempUserMessage],
      isStreaming: true,
      streamingContent: '',
      streamingReasoningContent: '',
      messagesError: null,
      streamController: controller,
    }));

    try {
      await qaApi.sendMessageStream(conversationId, content, {
        use_rag,
        use_image,
        image_base64,
        model_name,
        enable_thinking,
        thinking_budget,
        preserve_thinking,
        onChunk: (chunk) => {
          set((state) => ({
            streamingContent: state.streamingContent + chunk,
          }));
        },
        onReasoningChunk: (reasoningChunk) => {
          set((state) => ({
            streamingReasoningContent:
              state.streamingReasoningContent + reasoningChunk,
          }));
        },
        onDone: async (citations) => {
          // 先将流式内容落到消息列表，避免流结束到拉取历史之间出现“消息消失”空窗
          set((state) => ({
            messages: [
              ...state.messages,
              {
                id: -Date.now(),
                conversation_id: conversationId,
                content: state.streamingContent || '',
                role: 'assistant',
                create_time: new Date().toISOString(),
                citations: citations ?? undefined,
                reasoning_content: state.streamingReasoningContent || undefined,
              },
            ],
            isStreaming: false,
            streamingContent: '',
            streamingReasoningContent: '',
            streamController: null,
          }));
          await get().tryGenerateConversationTitle(conversationId);
        },
        onError: (detail) => {
          set({
            isStreaming: false,
            streamingContent: '',
            streamingReasoningContent: '',
            messagesError: detail,
            streamController: null,
          });
        },
        signal: controller.signal,
      });
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        console.log('流式发送被取消');
        set({
          isStreaming: false,
          streamingContent: '',
          streamingReasoningContent: '',
          streamController: null,
        });
        return;
      }
      // 非中断错误
      set((state) => ({
        messages: state.messages.filter((msg) => msg.id !== tempUserMessage.id),
        isStreaming: false,
        streamingContent: '',
        streamingReasoningContent: '',
        streamController: null,
        messagesError: error instanceof Error ? error.message : '发送消息失败',
      }));
    }
  },

  clearMessagesError: () => {
    set({ messagesError: null });
  },
}));
