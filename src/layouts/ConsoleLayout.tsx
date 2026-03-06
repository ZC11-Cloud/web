import { useState } from 'react';
import { Layout, Menu, Typography, Avatar, Button, message, Divider } from 'antd';
import {
  EditTwoTone,
  UploadOutlined,
  BookOutlined,
  UserOutlined,
  LogoutOutlined,
} from '@ant-design/icons';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './ConsoleLayout.css';
import { useUserStore } from '../store/useUserStore';
import Conversation from '../components/Conversation';

const { Sider, Content } = Layout;
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
    { key: '/ai-chat', icon: <EditTwoTone />, label: '新对话', path: '/ai-chat' },
    { key: '/image-recognition', icon: <UploadOutlined />, label: '图像识别', path: '/image-recognition' },
    { key: '/knowledge-base', icon: <BookOutlined />, label: '知识库', path: '/knowledge-base' },
    { key: '/profile', icon: <UserOutlined />, label: '个人中心', path: '/profile' },
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
            selectedKeys={[location.pathname === '/' ? '/ai-chat' : location.pathname]}
            className="console-menu"
            items={menuItems.map((item) => ({
              key: item.path,
              icon: item.icon,
              label: <Link to={item.path}>{item.label}</Link>,
            }))}
          />
        </div>
        <Divider size="small"/> 
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

        {/* 侧栏底部：用户与退出 */}
        {/* {!collapsed && (
          <div className="sider-footer">
            <Avatar size="small" icon={<UserOutlined />} />
            <span className="sider-user-text">用户</span>
            <Button
              type="text"
              icon={<LogoutOutlined />}
              onClick={handleLogout}
              className="sider-logout"
            />
          </div>
        )} */}
      </Sider>

      {/* 右侧：整块对话/内容区；对话页全高无外边距，其余页面保留卡片区 */}
      <Content className="console-content">
        {location.pathname === '/' || location.pathname === '/ai-chat' ? (
          children
        ) : (
          <div className="content-wrapper">{children}</div>
        )}
      </Content>
    </Layout>
  );
};

export default ConsoleLayout;
