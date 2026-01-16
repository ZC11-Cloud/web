import { useState } from 'react';
import { Layout, Menu, Typography, Avatar, Space, Button, message } from 'antd';
import {
  MessageOutlined,
  UploadOutlined,
  BookOutlined,
  HomeOutlined,
  UserOutlined,
  LogoutOutlined,
  CiOutlined,
} from '@ant-design/icons';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './ConsoleLayout.css';
import { useUserStore } from '../store/useUserStore';
const { Header, Sider, Content } = Layout;
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

  const menuItems: MenuItem[] = [
    {
      key: '/dashboard',
      icon: <HomeOutlined />,
      label: '控制台首页',
      path: '/dashboard',
    },
    {
      key: '/dashboard/ai-chat',
      icon: <MessageOutlined />,
      label: 'AI智能咨询',
      path: '/dashboard/ai-chat',
    },
    {
      key: '/dashboard/image-recognition',
      icon: <UploadOutlined />,
      label: '图像识别',
      path: '/dashboard/image-recognition',
    },
    {
      key: '/dashboard/knowledge-base',
      icon: <BookOutlined />,
      label: '知识库',
      path: '/dashboard/knowledge-base',
    },
    {
      key: '/dashboard/profile',
      icon: <UserOutlined />,
      label: '个人中心',
      path: '/dashboard/profile',
    },
  ];

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
      >
        <div className="logo">
          <CiOutlined
            style={{ fontSize: '24px', color: '#1890ff', marginRight: '10px' }}
          />
          {!collapsed && (
            <Title level={4} style={{ margin: 0, color: '#fff' }}>
              AquaMind
            </Title>
          )}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems.map((item) => ({
            key: item.path,
            icon: item.icon,
            label: <Link to={item.path}>{item.label}</Link>,
          }))}
        />
      </Sider>

      <Layout className="console-main">
        <Header className="console-header">
          <div className="header-left">
            {!collapsed && (
              <Title level={4} style={{ margin: 0, color: '#fff' }}>
                控制台
              </Title>
            )}
          </div>
          <div className="header-right">
            <Space>
              <Avatar icon={<UserOutlined />} />
              <span style={{ color: '#fff' }}>欢迎，用户</span>
              <Button
                icon={<LogoutOutlined />}
                onClick={handleLogout}
                style={{ borderColor: '#fff' }}
              >
                退出登录
              </Button>
            </Space>
          </div>
        </Header>

        <Content className="console-content">
          <div className="content-wrapper">{children}</div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default ConsoleLayout;
