import { useState, useEffect } from 'react';
import {
  Typography,
  Avatar,
  message,
  Flex,
  Spin,
} from 'antd';
import { Actions, Bubble, Sender } from '@ant-design/x';
import {
  UserOutlined,
  CopyOutlined,
  RedoOutlined,
} from '@ant-design/icons';
import './AIChat.css';
import Conversation from '../components/Conversation';
import { useConversationStore } from '../store/useConversationStore';
import type { Message as ApiMessage } from '../api/qaApi';

const { Title, Paragraph } = Typography;

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
                  padding: '16px'
                }}
                items={formattedMessages.map((msg) => ({
                  key: String(msg.id),
                  role: msg.sender,
                  content: msg.content,
                  placement: msg.sender === 'user' ? 'end' : 'start',
                  footerPlacement: msg.sender === 'user' ? 'outer-end' : 'outer-start',
                  header: msg.sender === 'user' ? 'User' : 'AquaMind',
                  avatar: <Avatar icon={<UserOutlined />} />,
                  footer: (content) => (
                    <Actions
                      items={actionItems}
                      onClick={() => console.log(content)}
                    />
                  ),
                  loading:
                    msg.sender === 'ai' &&
                    messagesLoading &&
                    msg.id !== -1,
                }))}
                autoScroll={true}
              />
          </div>
          <div className="chat-input">
            <Flex vertical gap={'middle'}>
              <Sender
                value={inputValue}
                onSubmit={async (text) => {
                  if (!text.trim() || !currentConversationId) {
                    return;
                  }
                  
                  // 清空输入框
                  setInputValue('');
                  
                  // 发送消息
                  await sendMessage(currentConversationId, text);
                }}
                disabled={!currentConversationId}
                placeholder={currentConversationId ? "输入消息..." : "请先选择一个会话"}
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
