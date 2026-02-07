import './index.css';
import { useEffect } from 'react';
import {
  DeleteOutlined,
  EditOutlined,
  ShareAltOutlined,
  StopOutlined,
} from '@ant-design/icons';
import { Conversations } from '@ant-design/x';
import type { ConversationsProps } from '@ant-design/x';
import type { GetProp } from 'antd';
import { message } from 'antd';
import { useConversationStore } from '../../store/useConversationStore';
const items: GetProp<ConversationsProps, 'items'> = Array.from({
  length: 4,
}).map((_, index) => ({
  key: `item${index + 1}`,
  label: `对话 ${index + 1}`,
  disabled: index === 3,
}));

const Conversation = () => {
  const {
    conversations,
    loading,
    error,
    currentConversationId,
    fetchConversations,
    setCurrentConversation,
    clearError,
  } = useConversationStore();

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  useEffect(() => {
    if (error) {
      message.error(error);
      clearError();
    }
  }, [error, clearError]);

  const items: ConversationsProps['items'] = conversations.map(
    (conv) => ({
      key: conv.id.toString(),
      label: conv.title,
    })
  );

  const menuConfig: ConversationsProps['menu'] = {
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
      },
    ],
    onClick: (itemInfo) => {
      console.log(`Click ${itemInfo.key}`);
      itemInfo.domEvent.stopPropagation();
    },
  };
  const newChatClick = () => {
    console.log('Click new chat');
  };
  return (
    <div className="conversation-container">
      <Conversations
        creation={{
          label: '新建对话',
          onClick: newChatClick,
        }}
        defaultActiveKey="item1"
        menu={menuConfig}
        items={items}
      />
    </div>
  );
};

export default Conversation;
