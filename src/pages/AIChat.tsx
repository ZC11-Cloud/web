import { useState, useEffect } from 'react';
import { Typography, Avatar, message, Flex, Skeleton, theme, Switch, Space, Upload } from 'antd';
import { Actions, Bubble, Sender } from '@ant-design/x';
import { UserOutlined, CopyOutlined, RedoOutlined, BookOutlined, PictureOutlined } from '@ant-design/icons';
import { XMarkdown } from '@ant-design/x-markdown';
import type { UploadProps } from 'antd';
import '@ant-design/x-markdown/themes/light.css';
import '@ant-design/x-markdown/themes/dark.css';
import './AIChat.css';
import Conversation from '../components/Conversation';
import { useConversationStore } from '../store/useConversationStore';
import type { Message as ApiMessage } from '../api/qaApi';

const { Title, Paragraph } = Typography;

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
  } = useConversationStore();

  const [inputValue, setInputValue] = useState('');
  const [useRag, setUseRag] = useState(false);
  const [useImage, setUseImage] = useState(false);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
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

  return (
    <div className="ai-chat">
      <div className="page-header">
        <Title level={3}>AI智能咨询</Title>
        <Paragraph style={{ color: '#666' }}>
          与AI助手对话，获取水生生物相关专业知识
        </Paragraph>
      </div>

      <div className="chat-container">
        <Conversation />
        <div className="chat-main">
          <div className="chat-messages">
            <Bubble.List
              style={{
                height: 'calc(100vh - 250px)',
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
            <Flex vertical gap={'middle'}>
              <Space wrap>
                <Space>
                  <BookOutlined />
                  <span>使用知识库</span>
                  <Switch size="small" checked={useRag} onChange={setUseRag} />
                </Space>
                <Space>
                  <PictureOutlined />
                  <span>使用图像识别</span>
                  <Switch size="small" checked={useImage} onChange={(v) => { setUseImage(v); if (!v) setImageBase64(null); }} />
                </Space>
                {useImage && (
                  <Upload {...uploadImageProps}>
                    <span style={{ color: '#1890ff', cursor: 'pointer' }}>
                      {imageBase64 ? '已选图，点击更换' : '上传图片'}
                    </span>
                  </Upload>
                )}
              </Space>
              <Sender
                value={inputValue}
                onSubmit={async (text) => {
                  if (!text.trim() || !currentConversationId) {
                    return;
                  }
                  const opts = {
                    use_rag: useRag,
                    use_image: useImage,
                    image_base64: imageBase64 ?? undefined,
                  };
                  console.log('[DEBUG] AIChat 发送参数:', {
                    use_rag: opts.use_rag,
                    use_image: opts.use_image,
                    image_base64: opts.image_base64 ? `${opts.image_base64.length} 字符` : '未传',
                  });
                  setInputValue('');
                  await sendMessage(currentConversationId, text, opts);
                  setImageBase64(null);
                }}
                disabled={!currentConversationId}
                placeholder={
                  currentConversationId ? '输入消息...' : '请先选择一个会话'
                }
                onChange={(value) => setInputValue(value)}
              />
            </Flex>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIChat;
