import { useNavigate } from 'react-router-dom';
import './AIChat.css';
import ChatMessageList from './ai-chat/components/ChatMessageList';
import ChatSenderPanel from './ai-chat/components/ChatSenderPanel';
import useAIChatController from './ai-chat/hooks/useAIChatController';

const AIChat = () => {
  const navigate = useNavigate();
  const {
    messagesLoading,
    currentConversationId,
    isStreaming,
    formattedMessages,
    fillSenderInput,
    senderRef,
    attachmentsRef,
    attachmentsOpen,
    setAttachmentsOpen,
    attachmentItems,
    handleAttachmentItemsChange,
    inputValue,
    setInputValue,
    handleSubmit,
    cancelStreaming,
    handlePasteFiles,
    useDeepSearch,
    setUseDeepSearch,
    useRag,
    setUseRag,
    useImage,
    setUseImage,
  } = useAIChatController();

  return (
    <div className="ai-chat">
      <div className="chat-main">
        <div className="chat-messages">
          <ChatMessageList
            messages={formattedMessages}
            messagesLoading={messagesLoading}
            isStreaming={isStreaming}
            onEditUserMessage={fillSenderInput}
            onSourceClick={(sourceId) => {
              navigate(
                `/knowledge-base/documents/${encodeURIComponent(sourceId)}`
              );
            }}
          />
        </div>
        <div className="chat-input">
          <ChatSenderPanel
            senderRef={senderRef}
            attachmentsRef={attachmentsRef}
            attachmentsOpen={attachmentsOpen}
            onAttachmentsOpenChange={setAttachmentsOpen}
            attachmentItems={attachmentItems}
            onAttachmentItemsChange={handleAttachmentItemsChange}
            inputValue={inputValue}
            onInputChange={setInputValue}
            isStreaming={isStreaming}
            onSubmit={handleSubmit}
            onCancel={cancelStreaming}
            onPasteFiles={handlePasteFiles}
            placeholder={
              currentConversationId
                ? '输入消息...'
                : '输入消息，发送将自动创建新对话'
            }
            useDeepSearch={useDeepSearch}
            onUseDeepSearchChange={setUseDeepSearch}
            useRag={useRag}
            onUseRagChange={setUseRag}
            useImage={useImage}
            onUseImageChange={setUseImage}
          />
        </div>
      </div>
    </div>
  );
};

export default AIChat;
