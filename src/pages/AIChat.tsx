import React, { useState, useEffect, useRef } from 'react';
import { Avatar, message, Flex, Skeleton, theme, Button } from 'antd';
import { Actions, Bubble, Attachments, Sender, Sources } from '@ant-design/x';
import type { AttachmentsProps } from '@ant-design/x';
import type { GetProp, GetRef } from 'antd';

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
import '@ant-design/x-markdown/themes/light.css';
import '@ant-design/x-markdown/themes/dark.css';
import './AIChat.css';
import { useConversationStore } from '../store/useConversationStore';
import qaApi from '../api/qaApi';
import type { Message as ApiMessage, KnowledgeCitation } from '../api/qaApi';
import { useModelStore } from '../store/useModelStore';
import ThoughtChainPanel from '../components/ThoughtChainPanel';

// 知识库引用上标组件：有 citations 时用 Sources 渲染可溯源链接，否则退化为普通 sup
const SupCitation = React.memo(
  (props: { children?: React.ReactNode; citations?: KnowledgeCitation[] | null }) => {
    const { children, citations } = props;
    const key = parseInt(`${children}` || '0', 10);
    if (!citations?.length) {
      return <sup>{children}</sup>;
    }
    const items = citations.map((c) => ({
      key: c.key,
      title: `${c.key}. ${c.filename}`,
      url: `/knowledge-base/documents/${c.source_id}`,
      description: c.snippet,
    }));
    return (
      <Sources
        activeKey={key}
        title={children}
        items={items}
        inline={true}
      />
    );
  }
);

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
  const { theme: antdTheme } = theme.useToken();

  // 从附件列表中取第一张图片转为 base64，并自动开启图像识别
  const syncImageFromAttachments = (fileList: GetProp<AttachmentsProps, 'items'>) => {
    const imageItem = fileList?.find(
      (f) => (f.originFileObj as File | undefined)?.type?.startsWith?.('image/')
    );
    const file = imageItem?.originFileObj as File | undefined;
    if (!file) {
      setUseImage(false);
      setImageBase64(null);
      return;
    }
    const isLt5M = file.size / 1024 / 1024 < 5;
    if (!isLt5M) {
      message.error('图片大小不能超过 5MB');
      setUseImage(false);
      setImageBase64(null);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      let base64 = dataUrl.includes(',') ? dataUrl.split(',')[1] : dataUrl;
      if (base64) base64 = base64.replace(/\s/g, ''); // 去掉换行和空格，避免后端解码失败
      setImageBase64(base64 ?? null);
      setUseImage(true);
    };
    reader.readAsDataURL(file);
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
          image_url: undefined,
        },
      ];
    }

    const list = messages.map((msg: ApiMessage) => ({
      id: msg.id,
      content: msg.content,
      sender: msg.role === 'user' ? ('user' as const) : ('ai' as const),
      timestamp: new Date(msg.create_time),
      image_url: msg.image_url ?? undefined,
      citations: msg.citations ?? undefined,
    }));

    if (isStreaming) {
      list.push({
        id: -1,
        content: streamingContent || ' ',
        sender: 'ai' as const,
        timestamp: new Date(),
        image_url: undefined,
        citations: undefined,
      });
    }
    return list;
  };

  const formattedMessages = formatMessages();

  const lastAiIndex = formattedMessages.reduce<number>((lastIndex, msg, index) => {
    if (msg.sender === 'ai' && msg.id !== 0 && msg.id !== -1) {
      return index;
    }
    return lastIndex;
  }, -1);

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

  const senderHeader = (
    <Sender.Header
      title="附件"
      styles={{ content: { padding: 0 } }}
      open={attachmentsOpen}
      onOpenChange={setAttachmentsOpen}
      forceRender
    >
      <Attachments
        ref={attachmentsRef}
        beforeUpload={() => false}
        items={attachmentItems}
        onChange={({ fileList }) => {
          setAttachmentItems(fileList);
          syncImageFromAttachments(fileList ?? []);
        }}
        placeholder={(type) =>
          type === 'drop'
            ? { title: '将文件拖放到此处' }
            : {
                icon: <CloudUploadOutlined />,
                title: '上传文件',
                description: '点击或拖拽文件到此处上传',
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
            items={formattedMessages.map((msg, index) => ({
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
              loading: msg.sender === 'ai' && messagesLoading && msg.id !== -1,
              contentRender: (content: string) => (
                <>
                  {/* {currentConversationId &&
                    index === lastAiIndex && (
                      <ThoughtChainPanel className="thought-chain-wrapper" />
                    )} */}
                  {msg.sender === 'user' && msg.image_url && (
                    <img
                      src={
                        msg.image_url.startsWith('http')
                          ? msg.image_url
                          : `${(import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '')}${msg.image_url}`
                      }
                      alt="用户上传"
                      style={{
                        maxWidth: '100%',
                        maxHeight: 200,
                        objectFit: 'contain',
                        marginBottom: 8,
                        borderRadius: 4,
                        display: 'block',
                      }}
                    />
                  )}
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
                    components={{
                      ...(msg.sender === 'ai' && msg.id === -1
                        ? markdownLoadingComponents
                        : {}),
                      ...(msg.sender === 'ai' && 'citations' in msg
                        ? {
                            sup: (p: { children?: React.ReactNode }) => (
                              <SupCitation
                                {...p}
                                citations={msg.citations}
                              />
                            ),
                          }
                        : {}),
                    }}
                  />
                </>
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
            onPasteFile={(files) => {
              for (const file of files) {
                attachmentsRef.current?.upload(file);
              }
              setAttachmentsOpen(true);
            }}
            onSubmit={async (text) => {
              if (!text.trim()) return;

              const opts = {
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
                use_rag: opts.use_rag,
                use_image: opts.use_image,
                image_base64: opts.image_base64
                  ? `${opts.image_base64.length} 字符`
                  : '未传',
              });
              await sendMessage(conversationId, text, opts);
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
                      checkedChildren="深度思考"
                      unCheckedChildren="深度思考"
                      onChange={(checked: boolean) => setUseDeepSearch(checked)}
                    />
                    <SenderSwitch
                      value={useRag}
                      icon={<BookOutlined />}
                      checkedChildren="知识库"
                      unCheckedChildren="知识库"
                      onChange={(checked: boolean) => setUseRag(checked)}
                    />
                    <SenderSwitch
                      value={useImage}
                      icon={<PictureOutlined />}
                      checkedChildren="图像识别"
                      unCheckedChildren="图像识别"
                      onChange={(checked: boolean) => setUseImage(checked)}
                    />
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
