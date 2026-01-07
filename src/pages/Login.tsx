import './Login.css';
import {
  Form,
  Input,
  Row,
  Col,
  Card,
  Checkbox,
  Typography,
  Button,
} from 'antd';
import { UserOutlined, LockOutlined, CiOutlined } from '@ant-design/icons';
import { message } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import { useUserStore } from '../store/useUserStore';
import { useState } from 'react';
import userApi from '../api/userApi';
import type { LoginParams } from '../api/userApi';
const { Title, Paragraph } = Typography;
const Login = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login: loginStore } = useUserStore();
  const onFinish = async (values: LoginParams) => {
    setLoading(true);
    try {
      const loginParams: LoginParams = {
        username: values.username,
        password: values.password,
      };
      // 调用登录API
      await userApi.login(loginParams);

      // 获取当前用户信息
      const userInfo = await userApi.getCurrentUser();

      // 登录成功，将用户信息存储到状态管理中
      loginStore(userInfo.data);

      message.success('登录成功！');

      // 登录成功后，跳转到首页
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="login-container">
      <Row justify="center" align="middle" style={{ minHeight: '100vh' }}>
        <Col xs={24} sm={16} md={12} lg={8}>
          <Card className="login-card">
            <div className="login-header">
              <div className="logo">
                <CiOutlined style={{ fontSize: '32px', color: '#1890ff' }} />
                <Title level={2} style={{ margin: 0, marginLeft: '10px' }}>
                  AquaMind
                </Title>
              </div>
              <Paragraph style={{ margin: '10px 0 30px 0', color: '#666' }}>
                水生生物图像识别与智能咨询平台
              </Paragraph>
            </div>

            <Form
              form={form}
              name="login"
              initialValues={{ remember: true }}
              onFinish={onFinish}
              layout="vertical"
            >
              <Form.Item
                name="username"
                label="用户名"
                rules={[{ required: true, message: '请输入用户名！' }]}
              >
                <Input
                  prefix={<UserOutlined className="site-form-item-icon" />}
                  placeholder="请输入用户名"
                />
              </Form.Item>

              <Form.Item
                name="password"
                label="密码"
                rules={[{ required: true, message: '请输入密码！' }]}
              >
                <Input.Password
                  prefix={<LockOutlined className="site-form-item-icon" />}
                  placeholder="请输入密码"
                />
              </Form.Item>

              <Form.Item>
                <Row justify="space-between" align="middle">
                  <Col>
                    <Form.Item name="remember" valuePropName="checked" noStyle>
                      <Checkbox>记住我</Checkbox>
                    </Form.Item>
                  </Col>
                  <Col>
                    <a href="#" style={{ float: 'right' }}>
                      忘记密码？
                    </a>
                  </Col>
                </Row>
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  className="login-button"
                  block
                  loading={loading}
                >
                  登录
                </Button>
              </Form.Item>

              <Paragraph style={{ textAlign: 'center', marginTop: '20px' }}>
                还没有账号？ <Link to="/register">立即注册</Link>
              </Paragraph>
            </Form>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Login;
