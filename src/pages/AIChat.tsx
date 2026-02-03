import { useState } from 'react';
import {
  Typography,
  Input,
  Button,
  List,
  Avatar,
  message,
  Upload,
  Space,
  Card,
  Flex,
} from 'antd';
import { Actions, Bubble } from '@ant-design/x';
import {
  MessageOutlined,
  UserOutlined,
  SendOutlined,
  UploadOutlined,
  CopyOutlined,
  RedoOutlined,
} from '@ant-design/icons';
import './AIChat.css';
import Conversation from '../components/Conversation';

const { Title, Paragraph } = Typography;

interface Message {
  id: number;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

const AIChat = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      content: '你好！我是AquaMind智能助手，有什么关于水生生物的问题可以问我。',
      sender: 'ai',
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');

  const handleSend = () => {
    if (!inputValue.trim()) return;

    const newUserMessage: Message = {
      id: messages.length + 1,
      content: inputValue,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages([...messages, newUserMessage]);
    setInputValue('');

    // 模拟AI回复
    setTimeout(() => {
      const newAIMessage: Message = {
        id: messages.length + 2,
        content:
          '这是一个模拟的AI回复。水生生物图像识别与智能咨询平台正在为您服务！',
        sender: 'ai',
        timestamp: new Date(),
      };
      setMessages([...messages, newUserMessage, newAIMessage]);
    }, 1000);
  };

  const handleUpload = () => {
    message.success('图片上传成功！');
    // 后端交互暂不实现
    return false; // 阻止自动上传
  };

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
            <Flex vertical gap="small">
              <Flex gap="small" wrap>
                <div style={{ width: '100%' }}>
                  <Bubble
                    content="你好，我是你的AquaMind智能助手，有什么关于水生生物的问题可以问我。"
                    header="AquaMind"
                    avatar={<Avatar icon={<UserOutlined />} />}
                    footer={(content) => (
                      <Actions
                        items={actionItems}
                        onClick={() => console.log(content)}
                      />
                    )}
                  />
                </div>
              </Flex>
              <Flex gap="small" wrap>
                <div style={{ width: '100%' }}>
                  <Bubble
                    content="你好，我想知道水生生物的分类。"
                    placement="end"
                    footerPlacement="outer-end"
                    header="User"
                    avatar={<Avatar icon={<UserOutlined />} />}
                    footer={(content) => (
                      <Actions
                        items={actionItems}
                        onClick={() => console.log(content)}
                      />
                    )}
                  />
                </div>
              </Flex>
              <Flex gap="small" wrap>
                <div style={{ width: '100%' }}>
                  <Bubble
                    content="outer footer and align right"
                    footerPlacement="outer-start"
                    header="footer"
                    avatar={<Avatar icon={<UserOutlined />} />}
                    footer={(content) => (
                      <Actions
                        items={actionItems}
                        onClick={() => console.log(content)}
                      />
                    )}
                  />
                </div>
              </Flex>
              <Flex gap="small" wrap>
                <div style={{ width: '100%' }}>
                  <Bubble
                    content="outer footer and align left"
                    placement="end"
                    footerPlacement="outer-end"
                    header="footer"
                    avatar={<Avatar icon={<UserOutlined />} />}
                    footer={(content) => (
                      <Actions
                        items={actionItems}
                        onClick={() => console.log(content)}
                      />
                    )}
                  />
                </div>
              </Flex>
            </Flex>
          </div>
          <div className="chat-input">
            <Space style={{ width: '100%' }}>
              <Upload beforeUpload={handleUpload} showUploadList={false}>
                <Button icon={<UploadOutlined />}>上传图片</Button>
              </Upload>
              <Input
                placeholder="输入您的问题..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onPressEnter={handleSend}
                style={{ flex: 1 }}
              />
              <Button
                type="primary"
                icon={<SendOutlined />}
                onClick={handleSend}
              >
                发送
              </Button>
            </Space>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIChat;
