import { useEffect, useMemo, useRef, useState } from 'react';
import { message } from 'antd';
import { Attachments, Sender } from '@ant-design/x';
import type { AttachmentsProps } from '@ant-design/x';
import type { GetProp, GetRef } from 'antd';
import { useConversationStore } from '../../../store/useConversationStore';
import { useModelStore } from '../../../store/useModelStore';
import qaApi from '../../../api/qaApi';
import { formatChatMessages } from '../utils/chatMessage';
import { fileToBase64, getFirstImageFile, validateImageSize } from '../utils/imageFile';

const useAIChatController = () => {
  const {
    messages,
    messagesLoading,
    messagesError,
    currentConversationId,
    sendMessage,
    clearMessagesError,
    streamingContent,
    isStreaming,
    fetchConversations,
    setCurrentConversation,
    cancelStreaming,
  } = useConversationStore();
  const { currentModel } = useModelStore();

  const [inputValue, setInputValue] = useState('');
  const [useRag, setUseRag] = useState(false);
  const [useImage, setUseImage] = useState(false);
  const [useDeepSearch, setUseDeepSearch] = useState(false);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [attachmentsOpen, setAttachmentsOpen] = useState(false);
  const [attachmentItems, setAttachmentItems] = useState<
    GetProp<AttachmentsProps, 'items'>
  >([]);
  const attachmentsRef = useRef<GetRef<typeof Attachments>>(null);
  const senderRef = useRef<GetRef<typeof Sender>>(null);

  useEffect(() => {
    if (messagesError) {
      message.error(messagesError);
      clearMessagesError();
    }
  }, [messagesError, clearMessagesError]);

  const formattedMessages = useMemo(
    () =>
      formatChatMessages({
        currentConversationId,
        messages,
        isStreaming,
        streamingContent,
      }),
    [currentConversationId, messages, isStreaming, streamingContent]
  );

  const syncImageFromAttachments = async (
    fileList: GetProp<AttachmentsProps, 'items'>
  ) => {
    const file = getFirstImageFile(fileList);
    if (!file) {
      setUseImage(false);
      setImageBase64(null);
      return;
    }
    if (!validateImageSize(file)) {
      message.error('图片大小不能超过 5MB');
      setUseImage(false);
      setImageBase64(null);
      return;
    }
    try {
      const base64 = await fileToBase64(file);
      setImageBase64(base64 || null);
      setUseImage(true);
    } catch {
      message.error('读取图片失败，请重试');
      setUseImage(false);
      setImageBase64(null);
    }
  };

  const handleAttachmentItemsChange = (
    fileList: GetProp<AttachmentsProps, 'items'>
  ) => {
    setAttachmentItems(fileList);
    void syncImageFromAttachments(fileList);
  };

  const handlePasteFiles = (files: FileList | File[]) => {
    for (const file of Array.from(files)) {
      attachmentsRef.current?.upload(file);
    }
    setAttachmentsOpen(true);
  };

  const handleSubmit = async (text: string) => {
    if (!text.trim()) return;

    const options = {
      use_rag: useRag,
      use_image: useImage,
      image_base64: imageBase64 ?? undefined,
      model_name: currentModel,
    };
    setInputValue('');
    setImageBase64(null);
    setUseImage(false);
    setAttachmentItems([]);

    let conversationId = currentConversationId;
    if (!conversationId) {
      try {
        const newConv = await qaApi.createConversation({
          title: '新对话',
        });
        await fetchConversations();
        setCurrentConversation(newConv.id, { skipFetch: true });
        conversationId = newConv.id;
      } catch {
        message.error('创建会话失败，请重试');
        return;
      }
    }

    console.log('[DEBUG] AIChat 发送参数:', {
      use_rag: options.use_rag,
      use_image: options.use_image,
      image_base64: options.image_base64
        ? `${options.image_base64.length} 字符`
        : '未传',
    });
    await sendMessage(conversationId, text, options);
  };

  const fillSenderInput = (content: string) => {
    setInputValue(content);
    setTimeout(() => {
      const root = senderRef.current?.nativeElement;
      const inputElement = root?.querySelector('textarea, input');
      if (inputElement instanceof HTMLElement) {
        inputElement.focus();
      }
    }, 0);
  };

  return {
    currentConversationId,
    messagesLoading,
    isStreaming,
    attachmentsRef,
    senderRef,
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
    formattedMessages,
    fillSenderInput,
  };
};

export default useAIChatController;
