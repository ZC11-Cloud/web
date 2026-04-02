import type { ChatMessageFormatterParams, ChatMessageItem } from '../types';

export const DEFAULT_GREETING_MESSAGE: ChatMessageItem = {
  id: 0,
  content: '你好！我是AquaMind智能助手，有什么关于水生生物的问题可以问我。',
  sender: 'ai',
  timestamp: new Date(),
};

export const formatChatMessages = (
  params: ChatMessageFormatterParams
): ChatMessageItem[] => {
  const {
    currentConversationId,
    messages,
    isStreaming,
    streamingContent,
    streamingReasoningContent,
  } = params;

  if (!currentConversationId) {
    return [DEFAULT_GREETING_MESSAGE];
  }

  const formatted = messages.map((msg) => ({
    id: msg.id,
    content: msg.content,
    sender: msg.role === 'user' ? ('user' as const) : ('ai' as const),
    timestamp: new Date(msg.create_time),
    image_url: msg.image_url ?? undefined,
    citations: msg.citations ?? undefined,
    reasoning_content: msg.reasoning_content ?? undefined,
  }));

  if (isStreaming) {
    formatted.push({
      id: -1,
      content: streamingContent || ' ',
      sender: 'ai',
      timestamp: new Date(),
      image_url: undefined,
      citations: undefined,
      reasoning_content: streamingReasoningContent || undefined,
    });
  }

  return formatted;
};
