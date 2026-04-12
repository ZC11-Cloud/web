import './index.css';
import { useEffect } from 'react';
import {
  DeleteOutlined,
  EditOutlined,
  RedoOutlined,
  ShareAltOutlined,
  StopOutlined,
} from '@ant-design/icons';
import { Conversations } from '@ant-design/x';
import type { ConversationsProps } from '@ant-design/x';
import type { GetProp } from 'antd';
import { message, Spin } from 'antd';
import { useConversationStore } from '../../store/useConversationStore';
import { useNavigate, useLocation } from 'react-router-dom';
import InfiniteScroll from 'react-infinite-scroll-component';

const Conversation = () => {
  const {
    conversations,
    total,
    error,
    currentConversationId,
    fetchConversations,
    setCurrentConversation,
    clearError,
    deleteConversation,
    loadMoreConversations,
  } = useConversationStore();
  const navigate = useNavigate();
  const location = useLocation();
  const isChatRoute =
    location.pathname === '/ai-chat' || location.pathname === '/';
  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  useEffect(() => {
    if (error) {
      message.error(error);
      clearError();
    }
  }, [error, clearError]);

  const sortedConversations = [...conversations].sort((a, b) => {
    return (
      new Date(b.create_time).getTime() - new Date(a.create_time).getTime()
    );
  });

  const items: GetProp<ConversationsProps, 'items'> = sortedConversations.map(
    (conv) => ({
      key: conv.id.toString(),
      label: (
        <span
          className={
            isChatRoute && conv.id === currentConversationId
              ? 'conversation-title-active'
              : undefined
          }
        >
          {conv.title}
        </span>
      ),
    })
  );

  const menuConfig: ConversationsProps['menu'] = (conversation) => ({
    items: [
      {
        label: '重命名',
        key: 'rename',
        icon: <EditOutlined />,
      },
      {
        label: '分享',
        key: 'share',
        icon: <ShareAltOutlined />,
      },
      {
        type: 'divider',
      },
      {
        label: '归档',
        key: 'archive',
        icon: <StopOutlined />,
        disabled: true,
      },
      {
        label: '删除聊天',
        key: 'deleteChat',
        icon: <DeleteOutlined />,
        danger: true,
        onClick: async () => {
          try {
            await deleteConversation(parseInt(conversation.key, 10));
            message.success('删除会话成功');
          } catch (error) {
            message.error('删除会话失败');
          }
        },
      },
    ],
    onClick: (itemInfo) => {
      // console.log(itemInfo);
      console.log(`Click ${itemInfo.key}`);
      itemInfo.domEvent.stopPropagation();
    },
  });

  return (
    <div className="conversation-container" id="scrollableDiv">
      <InfiniteScroll
        dataLength={items.length}
        next={loadMoreConversations}
        hasMore={items.length < total}
        loader={
          <div style={{ textAlign: 'center' }}>
            <Spin indicator={<RedoOutlined spin />} size="small" />
          </div>
        }
        endMessage={<div style={{ textAlign: 'center' }}>没有更多数据了</div>}
        scrollableTarget="scrollableDiv"
        style={{ overflow: 'hidden' }}
      >
        <Conversations
          activeKey={
            isChatRoute ? currentConversationId?.toString() : undefined
          }
          menu={menuConfig}
          items={items}
          onActiveChange={(value: string) => {
            if (location.pathname !== '/ai-chat' && location.pathname !== '/') {
              navigate(`/ai-chat`);
            }
            setCurrentConversation(parseInt(value, 10));
          }}
        />
      </InfiniteScroll>
    </div>
  );
};

export default Conversation;
