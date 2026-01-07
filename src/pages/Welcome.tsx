import { Link } from "react-router-dom";
import { CiOutlined, UploadOutlined, MessageOutlined, BookOutlined } from "@ant-design/icons";
import "./Welcome.css";
import { Typography, Space, Button, Row, Col, Card } from "antd";
const { Title, Paragraph } = Typography;
const Welcome = () => {
  return (
    <div className="welcome-container">
      {/* 顶部导航 */}
      <div className="welcome-header">
        <div className="logo">
          <CiOutlined style={{ fontSize: "24px", color: "#1890ff" }} />
          <span className="logo-text">AuqaMind</span>
        </div>
        <div className="nav-links">
          <Link to="/login">登录</Link>
          <Link to="/register">注册</Link>
        </div>
      </div>
      {/* 主内容 */}
      <div className="welcome-main">
        <div className="welcome-banner">
          <Title level={1} style={{ color: "#fff", marginBottom: "20px" }}>
            水生生物图像识别与智能咨询平台
          </Title>
          <Paragraph
            style={{ color: "#fff", fontSize: "18px", marginBottom: "40px" }}
          >
            基于AI技术的水生生物识别与智能咨询服务，为您提供专业的水生生物知识和识别服务
          </Paragraph>
          <Space>
            <Button type="primary" size="large" href="/dashboard/image-recognition">
              <UploadOutlined /> 开始识别
            </Button>
            <Button
              size="large"
              style={{ backgroundColor: "#fff" }}
              href="/dashboard/ai-chat"
            >
              <MessageOutlined /> 智能咨询
            </Button>
          </Space>
        </div>
        <div className="welcome-features">
          <Row gutter={[32, 32]} style={{ marginTop: "60px" }}>
            <Col xs={24} md={8}>
              <Card hoverable>
                <div className="feature-icon">
                  <UploadOutlined
                    style={{ fontSize: "48px", color: "#1890ff" }}
                  />
                </div>
                <Title level={3}>图像识别</Title>
                <Paragraph>
                  上传水生生物图像，AI快速识别物种信息，提供详细的生物学特征和分布情况
                </Paragraph>
                <Button type="primary" block href="/dashboard/image-recognition">
                  立即使用
                </Button>
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card hoverable>
                <div className="feature-icon">
                  <MessageOutlined
                    style={{ fontSize: "48px", color: "#52c41a" }}
                  />
                </div>
                <Title level={3}>AI智能咨询</Title>
                <Paragraph>
                  与AI对话，获取水生生物相关问题的专业解答，支持自然语言交互
                </Paragraph>
                <Button type="primary" block href="/dashboard/ai-chat">
                  立即咨询
                </Button>
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card hoverable>
                <div className="feature-icon">
                  <BookOutlined
                    style={{ fontSize: "48px", color: "#fa8c16" }}
                  />
                </div>
                <Title level={3}>知识库</Title>
                <Paragraph>
                  丰富的水生生物知识库，包含各种鱼类、贝类、藻类等水生生物的详细信息
                </Paragraph>
                <Button type="primary" block href="/dashboard/knowledge-base">
                  查看知识库
                </Button>
              </Card>
            </Col>
          </Row>
        </div>
      </div>
      {/* 页脚 */}
      <div className="welcome-footer">
        <Paragraph style={{ color: '#666', textAlign: 'center' }}>
          © 2024 AquaMind 水生生物图像识别与智能咨询平台
        </Paragraph>
      </div>
    </div>
  );
};

export default Welcome;
