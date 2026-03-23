import { useState } from 'react';
import {
  Layout,
  Menu,
  Typography,
  Avatar,
  Button,
  message,
  Divider,
  Dropdown,
  Select,
} from 'antd';
import {
  EditTwoTone,
  UploadOutlined,
  BookOutlined,
  UserOutlined,
  LogoutOutlined,
  MenuUnfoldOutlined,
  MenuFoldOutlined,
} from '@ant-design/icons';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './ConsoleLayout.css';
import { useUserStore } from '../store/useUserStore';
import Conversation from '../components/Conversation';
import qaApi from '../api/qaApi';
import { useConversationStore } from '../store/useConversationStore';
import { useModelStore, DEFAULT_MODEL_NAME } from '../store/useModelStore';
const { Sider, Content, Header } = Layout;
const { Title } = Typography;

interface MenuItem {
  key: string;
  icon: React.ReactNode;
  label: string;
  path: string;
}

const ConsoleLayout = ({ children }: { children: React.ReactNode }) => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const {
    fetchConversations,
    setCurrentConversation,
    conversations,
    currentConversationId,
  } = useConversationStore();
  const { currentModel, setCurrentModel } = useModelStore();
  const { user } = useUserStore();

  const currentConversation = conversations.find(
    (c) => c.id === currentConversationId
  );

  const modelOptions = [
    { label: 'Qwen3.5-Plus', value: 'qwen3.5-plus' },
    { label: 'Qwen3-Max', value: 'qwen3-max' },
    { label: 'Qwen3.5-Flash', value: 'qwen3.5-flash' },
    { label: 'Qwen3-VL-Plus', value: 'qwen3-vl-plus' },
    { label: 'Qwen3-VL-Flash', value: 'qwen3-vl-flash' },
  ];
  const menuItems: MenuItem[] = [
    {
      key: '/ai-chat',
      icon: <EditTwoTone />,
      label: '新对话',
      path: '/ai-chat',
    },
    {
      key: '/image-recognition',
      icon: <UploadOutlined />,
      label: '图像识别',
      path: '/image-recognition',
    },
    {
      key: '/knowledge-base',
      icon: <BookOutlined />,
      label: '知识库',
      path: '/knowledge-base',
    },
    {
      key: '/profile',
      icon: <UserOutlined />,
      label: '个人中心',
      path: '/profile',
    },
  ];

  const handleMenuClick = async ({ key }: { key: string }) => {
    if (key === '/ai-chat') {
      try {
        const newConversation = await qaApi.createConversation({
          title: '新对话',
        });

        message.success('创建新对话成功');

        // 刷新会话列表
        fetchConversations();

        // 设置当前会话为新创建的会话
        setCurrentConversation(newConversation.id);
      } catch (error) {
        message.error('创建新对话失败');
      }
    }

    // navigate(key);
  };

  const { logout: logoutStore } = useUserStore();
  const handleLogout = () => {
    localStorage.removeItem('token');
    logoutStore();
    message.success('退出登录成功！');
    navigate('/login');
  };

  return (
    <Layout className="console-layout">
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        className="console-sider"
        breakpoint="lg"
        collapsedWidth="0"
        width={260}
      >
        {/* 上：Logo + 菜单 */}
        <div className="sider-top">
          <div className="logo">
            {!collapsed && (
              <Title level={5} style={{ margin: 0, color: '#242425' }}>
                水生生物智能咨询平台
              </Title>
            )}
          </div>
          <Menu
            theme="light"
            mode="inline"
            selectedKeys={[
              location.pathname === '/' ? '/ai-chat' : location.pathname,
            ]}
            className="console-menu"
            items={menuItems.map((item) => ({
              key: item.path,
              icon: item.icon,
              label: <Link to={item.path}>{item.label}</Link>,
            }))}
            onClick={handleMenuClick}
          />
        </div>
        <Divider size="small" />
        {/* 下：历史聊天记录 */}
        <div className="sider-bottom">
          {!collapsed && (
            <>
              <div className="history-label">历史对话</div>
              <div className="sider-conversation">
                <Conversation />
              </div>
            </>
          )}
        </div>
        <Divider size="small" />
        {/* 侧栏底部：用户与退出 */}
        {!collapsed && (
          <div className="sider-footer">
            <Avatar size="small" icon={<UserOutlined />} />
            <span className="sider-user-text">{user?.username || '用户'}</span>
          </div>
        )}
      </Sider>
      <Layout className="console-layout-content">
        {(location.pathname === '/' || location.pathname === '/ai-chat') && (
          <Header className="console-header">
            <Button
              onClick={() => setCollapsed(!collapsed)}
              style={{ marginRight: 16, background: '#fff', width: 36 }}
            >
              {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            </Button>
            <Select
              value={currentModel || DEFAULT_MODEL_NAME}
              options={modelOptions}
              style={{ width: 160 }}
              onChange={(value) => setCurrentModel(value)}
            />
            <div className="console-header-title">
              {currentConversation?.title || '新对话'}
              <div className="console-header-subtitle">本内容由ai生成</div>
            </div>
          </Header>
        )}
        <Content className="console-content">
          {location.pathname === '/' || location.pathname === '/ai-chat' ? (
            children
          ) : (
            <div className="content-wrapper">{children}</div>
          )}
        </Content>
      </Layout>
    </Layout>
  );
};

export default ConsoleLayout;
