import type {
  KnowledgeCitation,
  Message as ApiMessage,
  QaAttachment,
  StreamTraceEvent,
} from '../../api/qaApi';

export interface ChatMessageItem {
  id: number;
  content: string;
  reasoning_content?: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  image_url?: string;
  attachments?: QaAttachment[];
  citations?: KnowledgeCitation[];
  trace_events?: StreamTraceEvent[];
}

export interface ChatMessageFormatterParams {
  currentConversationId: number | null;
  messages: ApiMessage[];
  isStreaming: boolean;
  streamingContent: string;
  streamingReasoningContent: string;
  streamingTraceEvents: StreamTraceEvent[];
}
