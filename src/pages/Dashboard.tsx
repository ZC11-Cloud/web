import { Card, Row, Col, Statistic, Typography } from 'antd';
import {
  MessageOutlined,
  UploadOutlined,
  BookOutlined,
  CiOutlined,
} from '@ant-design/icons';
import './Dashboard.css';

const { Title, Paragraph } = Typography;

const Dashboard = () => {
  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <Title level={3}>欢迎使用AquaMind控制台</Title>
        <Paragraph style={{ color: '#666' }}>
          一站式水生生物图像识别与智能咨询平台
        </Paragraph>
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: '30px' }}>
        <Col xs={24} sm={12} md={6}>
          <Card className="stat-card">
            <Statistic
              title="AI咨询次数"
              value={12345}
              prefix={<MessageOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="stat-card">
            <Statistic
              title="图像识别次数"
              value={8923}
              prefix={<UploadOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="stat-card">
            <Statistic
              title="知识库访问"
              value={23456}
              prefix={<BookOutlined />}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="stat-card">
            <Statistic
              title="识别物种数"
              value={156}
              prefix={<CiOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      <Title level={4} style={{ marginBottom: '20px' }}>快速功能</Title>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={8}>
          <Card
            hoverable
            className="function-card"
            cover={<div className="card-icon"><MessageOutlined style={{ fontSize: '48px', color: '#1890ff' }} /></div>}
          >
            <Title level={4}>AI智能咨询</Title>
            <Paragraph>与AI助手对话，获取水生生物相关专业知识</Paragraph>
            <a href="/console/ai-chat">立即使用 →</a>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card
            hoverable
            className="function-card"
            cover={<div className="card-icon"><UploadOutlined style={{ fontSize: '48px', color: '#52c41a' }} /></div>}
          >
            <Title level={4}>图像识别</Title>
            <Paragraph>上传水生生物图像，AI快速识别物种信息</Paragraph>
            <a href="/console/image-recognition">立即使用 →</a>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card
            hoverable
            className="function-card"
            cover={<div className="card-icon"><BookOutlined style={{ fontSize: '48px', color: '#fa8c16' }} /></div>}
          >
            <Title level={4}>知识库</Title>
            <Paragraph>浏览丰富的水生生物知识库资源</Paragraph>
            <a href="/console/knowledge-base">立即使用 →</a>
          </Card>
        </Col>
      </Row>

      <div className="dashboard-footer" style={{ marginTop: '40px', textAlign: 'center', color: '#999' }}>
        <Paragraph style={{ margin: 0 }}>© 2024 AquaMind 水生生物图像识别与智能咨询平台</Paragraph>
      </div>
    </div>
  );
};

export default Dashboard;