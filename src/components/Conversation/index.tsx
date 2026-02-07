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
import qaApi from '../../api/qaApi';

const Conversation = () => {
  const {
    conversations,
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

  const items: GetProp<ConversationsProps, 'items'> = conversations.map(
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
  
  // 创建新对话
  const newChatClick = async () => {
    try {
      const newConversation = await qaApi.createConversation({
        title: `新对话 ${new Date().toLocaleString()}`,
      });
      
      message.success('创建新对话成功');
      
      // 刷新会话列表
      fetchConversations();
      
      // 设置当前会话为新创建的会话
      setCurrentConversation(newConversation.id);
    } catch (error) {
      message.error('创建新对话失败');
    }
  };

  return (
    <div className="conversation-container">
      <Conversations
        creation={{
          label: '新建对话',
          onClick: newChatClick,
        }}
        activeKey={currentConversationId?.toString()}
        menu={menuConfig}
        items={items}
        onActiveChange={(value: string) => setCurrentConversation(parseInt(value, 10))}
      />
    </div>
  );
};

export default Conversation;
