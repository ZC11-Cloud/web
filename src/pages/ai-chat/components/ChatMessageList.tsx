import { useState } from 'react';
import type { ReactNode } from 'react';
import { Avatar, message, Modal, Skeleton, theme } from 'antd';
import { Actions, Bubble } from '@ant-design/x';
import type { ActionsFeedbackProps, ActionsItemProps } from '@ant-design/x';
import { XMarkdown } from '@ant-design/x-markdown';
import '@ant-design/x-markdown/themes/light.css';
import '@ant-design/x-markdown/themes/dark.css';
import {
  UserOutlined,
  ShareAltOutlined,
  CheckOutlined,
  EditOutlined,
  RedoOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import SupCitation from './SupCitation';
import type { ChatMessageItem } from '../types';

interface ChatMessageListProps {
  messages: ChatMessageItem[];
  messagesLoading: boolean;
  isStreaming: boolean;
  onSourceClick: (sourceId: string) => void;
  onEditUserMessage: (content: string) => void;
}

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

const resolveImageUrl = (imageUrl: string) => {
  if (imageUrl.startsWith('http')) {
    return imageUrl;
  }
  const baseUrl = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '');
  return `${baseUrl}${imageUrl}`;
};

const ChatMessageList = (props: ChatMessageListProps) => {
  const { messages, messagesLoading, isStreaming, onSourceClick, onEditUserMessage } =
    props;
  const { theme: antdTheme } = theme.useToken();
  const [feedbackStatus, setFeedbackStatus] =
    useState<ActionsFeedbackProps['value']>('default');
  const [audioStatus, setAudioStatus] =
    useState<ActionsItemProps['status']>('default');
  const [shareStatus, setShareStatus] =
    useState<ActionsItemProps['status']>('default');

  const markdownThemeClass =
    (antdTheme as { id?: number })?.id === 0
      ? 'x-markdown-light'
      : 'x-markdown-dark';

  const createUserActionItems = (content: string) => [
    {
      key: 'copy',
      label: '复制',
      actionRender: () => <Actions.Copy text={content} />,
    },
    {
      key: 'edit',
      icon: <EditOutlined />,
      label: '编辑',
      onItemClick: () => onEditUserMessage(content),
    },
  ];

  const createAiActionItems = (content: string) => [
    {
      key: 'retry',
      label: '重试',
      icon: <RedoOutlined />,
    },
    {
      key: 'edit',
      icon: <EditOutlined />,
      label: '编辑',
    },
    {
      key: 'feedback',
      actionRender: () => (
        <Actions.Feedback
          value={feedbackStatus}
          styles={{
            liked: {
              color: '#f759ab',
            },
          }}
          onChange={(value) => {
            setFeedbackStatus(value);
            message.success(`反馈已更新为：${value}`);
          }}
          key="feedback"
        />
      ),
    },
    {
      key: 'copy',
      label: '复制',
      actionRender: () => <Actions.Copy text={content} />,
    },
    {
      key: 'audio',
      label: '语音',
      actionRender: () => (
        <Actions.Audio
          onClick={() => setAudioStatus('running')}
          status={audioStatus}
        />
      ),
    },
    {
      key: 'share',
      label: '分享',
      actionRender: () => (
        <Actions.Item
          onClick={() => setShareStatus('running')}
          label={shareStatus}
          status={shareStatus}
          defaultIcon={<ShareAltOutlined />}
          runningIcon={<CheckOutlined />}
        />
      ),
    },
    {
      key: 'more',
      subItems: [
        {
          key: 'delete',
          label: '删除',
          icon: <DeleteOutlined />,
          onItemClick: () => {
            Modal.confirm({
              title: '确认删除吗？',
              content: '删除后将无法恢复。',
              onOk() {
                message.success('删除成功');
              },
              onCancel() {
                message.info('已取消');
              },
            });
          },
          danger: true,
        },
      ],
    },
  ];

  return (
    <Bubble.List
      style={{
        flex: 1,
        minHeight: 0,
        padding: '16px',
      }}
      items={messages.map((msg) => ({
        key: String(msg.id),
        role: msg.sender,
        content: msg.content,
        placement: msg.sender === 'user' ? 'end' : 'start',
        footerPlacement: msg.sender === 'user' ? 'outer-end' : 'outer-start',
        header: msg.sender === 'user' ? '用户' : 'AquaMind',
        avatar: <Avatar icon={<UserOutlined />} />,
        footer: (content) => {
          const actionText = typeof content === 'string' ? content : msg.content;
          const items =
            msg.sender === 'user'
              ? createUserActionItems(actionText)
              : createAiActionItems(actionText);
          return <Actions items={items} />;
        },
        loading: msg.sender === 'ai' && messagesLoading && msg.id !== -1,
        contentRender: (content: string) => (
          <>
            {msg.sender === 'user' && msg.image_url && (
              <img
                src={resolveImageUrl(msg.image_url)}
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
                      sup: (citationProps: { children?: ReactNode }) => (
                        <SupCitation
                          {...citationProps}
                          citations={msg.citations}
                          onSourceClick={onSourceClick}
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
  );
};

export default ChatMessageList;
