import { useState, useEffect, useRef } from 'react';
import {
  Avatar,
  message,
  Flex,
  Skeleton,
  theme,
  Upload,
  Button,
  type GetProp,
  type GetRef,
} from 'antd';
import { Actions, Attachments, type AttachmentsProps, Bubble, Sender } from '@ant-design/x';

const SenderSwitch = Sender.Switch;
import {
  UserOutlined,
  CopyOutlined,
  RedoOutlined,
  BookOutlined,
  PictureOutlined,
  PaperClipOutlined,
  OpenAIOutlined,
  CloudUploadOutlined,
} from '@ant-design/icons';
import { XMarkdown } from '@ant-design/x-markdown';
import type { UploadProps } from 'antd';
import '@ant-design/x-markdown/themes/light.css';
import '@ant-design/x-markdown/themes/dark.css';
import './AIChat.css';
import { useConversationStore } from '../store/useConversationStore';
import qaApi from '../api/qaApi';
import type { Message as ApiMessage } from '../api/qaApi';


// 流式 Markdown 中未完整解析的链接/图片占位
const markdownLoadingComponents = {
  'loading-link': () => (
    <Skeleton.Button
      active
      size="small"
      style={{ margin: '4px 0', width: 16, height: 16 }}
    />
  ),
  'loading-image': () => (
    <Skeleton.Image active style={{ width: 60, height: 60 }} />
  ),
};

const AIChat = () => {
  // 使用状态管理
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
  } = useConversationStore();

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
  const { theme: antdTheme } = theme.useToken();

  const uploadImageProps: UploadProps = {
    name: 'file',
    showUploadList: false,
    maxCount: 1,
    accept: 'image/*',
    beforeUpload: (file) => {
      const isImage = file.type.startsWith('image/');
      if (!isImage) {
        message.error('请上传图片文件');
        return false;
      }
      const isLt5M = file.size / 1024 / 1024 < 5;
      if (!isLt5M) {
        message.error('图片大小不能超过 5MB');
        return false;
      }
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        let base64 = dataUrl.includes(',') ? dataUrl.split(',')[1] : dataUrl;
        if (base64) base64 = base64.replace(/\s/g, ''); // 去掉换行和空格，避免后端解码失败
        setImageBase64(base64 ?? null);
      };
      reader.readAsDataURL(file);
      return false;
    },
  };
  const markdownThemeClass =
    (antdTheme as { id?: number })?.id === 0
      ? 'x-markdown-light'
      : 'x-markdown-dark';

  // 错误提示
  useEffect(() => {
    if (messagesError) {
      message.error(messagesError);
      clearMessagesError();
    }
  }, [messagesError, clearMessagesError]);

  // 将API消息格式转换为组件需要的格式，流式输出时追加当前正在接收的 AI 气泡
  const formatMessages = () => {
    if (!currentConversationId) {
      return [
        {
          id: 0,
          content:
            '你好！我是AquaMind智能助手，有什么关于水生生物的问题可以问我。',
          sender: 'ai' as const,
          timestamp: new Date(),
        },
      ];
    }

    const list = messages.map((msg: ApiMessage) => ({
      id: msg.id,
      content: msg.content,
      sender: msg.role === 'user' ? ('user' as const) : ('ai' as const),
      timestamp: new Date(msg.create_time),
    }));

    if (isStreaming) {
      list.push({
        id: -1,
        content: streamingContent || ' ',
        sender: 'ai' as const,
        timestamp: new Date(),
      });
    }
    return list;
  };

  const formattedMessages = formatMessages();

  const actionItems = [
    {
      key: 'retry',
      icon: <RedoOutlined />,
      label: 'Retry',
    },
    {
      key: 'copy',
      icon: <CopyOutlined />,
      label: 'Copy',
    },
  ];

  const SwitchTextStyle = {
    display: 'inline-flex',
    width: 28,
    justifyContent: 'center',
    alignItems: 'center',
  };

  const senderHeader = (
    <Sender.Header
      title="Attachments"
      styles={{
        content: {
          padding: 0,
        },
      }}
      open={attachmentsOpen}
      onOpenChange={setAttachmentsOpen}
      forceRender
    >
      <Attachments
        ref={attachmentsRef}
        beforeUpload={() => false}
        items={attachmentItems}
        onChange={({ fileList }) => setAttachmentItems(fileList)}
        placeholder={(type) =>
          type === 'drop'
            ? {
                title: 'Drop file here',
              }
            : {
                icon: <CloudUploadOutlined />,
                title: 'Upload files',
                description: 'Click or drag files to this area to upload',
              }
        }
        getDropContainer={() => senderRef.current?.nativeElement}
      />
    </Sender.Header>
  );

  return (
    <div className="ai-chat">
      <div className="chat-main">
        <div className="chat-messages">
          <Bubble.List
            style={{
              flex: 1,
              minHeight: 0,
              padding: '16px',
            }}
              items={formattedMessages.map((msg) => ({
                key: String(msg.id),
                role: msg.sender,
                content: msg.content,
                placement: msg.sender === 'user' ? 'end' : 'start',
                footerPlacement:
                  msg.sender === 'user' ? 'outer-end' : 'outer-start',
                header: msg.sender === 'user' ? 'User' : 'AquaMind',
                avatar: <Avatar icon={<UserOutlined />} />,
                footer: (content) => (
                  <Actions
                    items={actionItems}
                    onClick={() => console.log(content)}
                  />
                ),
                loading:
                  msg.sender === 'ai' && messagesLoading && msg.id !== -1,
                contentRender: (content: string) => (
                  <XMarkdown
                    className={markdownThemeClass}
                    content={content}
                    paragraphTag="div"
                    streaming={
                      msg.sender === 'ai' && msg.id === -1
                        ? {
                            hasNextChunk: isStreaming,
                            enableAnimation: true,
                            incompleteMarkdownComponentMap: {
                              link: 'loading-link',
                              image: 'loading-image',
                            },
                          }
                        : undefined
                    }
                    components={
                      msg.sender === 'ai' && msg.id === -1
                        ? markdownLoadingComponents
                        : undefined
                    }
                  />
                ),
              }))}
              autoScroll={true}
            />
        </div>
        <div className="chat-input">
            <Sender
                ref={senderRef}
                header={senderHeader}
                prefix={
                  <Button
                    type="text"
                    style={{ fontSize: 16 }}
                    icon={<PaperClipOutlined />}
                    onClick={() => setAttachmentsOpen(!attachmentsOpen)}
                  />
                }
                value={inputValue}
                onSubmit={async (text) => {
                  if (!text.trim()) return;

                  const opts = {
                    use_rag: useRag,
                    use_image: useImage,
                    image_base64: imageBase64 ?? undefined,
                  };
                  setInputValue('');
                  setImageBase64(null);
                  setAttachmentItems([]);
                  setAttachmentsOpen(false);

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
                    use_rag: opts.use_rag,
                    use_image: opts.use_image,
                    image_base64: opts.image_base64
                      ? `${opts.image_base64.length} 字符`
                      : '未传',
                  });
                  await sendMessage(conversationId, text, opts);
                }}
                onPasteFile={(files) => {
                  for (const file of files) {
                    attachmentsRef.current?.upload(file);
                  }
                  setAttachmentsOpen(true);
                }}
                disabled={false}
                placeholder={
                  currentConversationId
                    ? '输入消息...'
                    : '输入消息，发送将自动创建新对话'
                }
                onChange={(value) => setInputValue(value)}
                footer={() => {
                  return (
                    <Flex justify="space-between" align="center">
                      <Flex gap="small" align="center">
                        <SenderSwitch
                          value={useDeepSearch}
                          icon={<OpenAIOutlined />}
                          checkedChildren={
                            <>
                              深度搜索：<span style={SwitchTextStyle}>开启</span>
                            </>
                          }
                          unCheckedChildren={
                            <>
                              深度搜索：<span style={SwitchTextStyle}>关闭</span>
                            </>
                          }
                          onChange={(checked: boolean) => setUseDeepSearch(checked)}
                        />
                        <SenderSwitch
                          value={useRag}
                          icon={<BookOutlined />}
                          checkedChildren={
                            <>
                              知识库：<span style={SwitchTextStyle}>开启</span>
                            </>
                          }
                          unCheckedChildren={
                            <>
                              知识库：<span style={SwitchTextStyle}>关闭</span>
                            </>
                          }
                          onChange={(checked: boolean) => setUseRag(checked)}
                        />
                        <SenderSwitch
                          value={useImage}
                          icon={<PictureOutlined />}
                          checkedChildren={
                            <>
                              图像识别：<span style={SwitchTextStyle}>开启</span>
                            </>
                          }
                          unCheckedChildren={
                            <>
                              图像识别：<span style={SwitchTextStyle}>关闭</span>
                            </>
                          }
                          onChange={(checked: boolean) => {
                            setUseImage(checked);
                            if (!checked) setImageBase64(null);
                          }}
                        />
                        {useImage && (
                          <Upload {...uploadImageProps}>
                            <span style={{ color: '#1890ff', cursor: 'pointer' }}>
                              {imageBase64 ? '已选图，点击更换' : '上传图片'}
                            </span>
                          </Upload>
                        )}
                      </Flex>
                    </Flex>
                  );
                }}
                allowSpeech={true}
              />
        </div>
      </div>
    </div>
  );
};

export default AIChat;
