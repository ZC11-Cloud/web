import type { KnowledgeCitation, Message as ApiMessage } from '../../api/qaApi';

export interface ChatMessageItem {
  id: number;
  content: string;
  reasoning_content?: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  image_url?: string;
  citations?: KnowledgeCitation[];
}

export interface ChatMessageFormatterParams {
  currentConversationId: number | null;
  messages: ApiMessage[];
  isStreaming: boolean;
  streamingContent: string;
  streamingReasoningContent: string;
}
