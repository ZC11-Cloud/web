import { Button, Card, Form, Input, Typography, Row, Col, message } from 'antd';
import {
  CiOutlined,
  UserOutlined,
  LockOutlined,
  MailOutlined,
  PhoneOutlined,
} from '@ant-design/icons';
import { Link } from 'react-router-dom';
import './Register.css';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import userApi from '../api/userApi';
import type { RegisterParams } from '../api/userApi';
const { Title, Paragraph } = Typography;

const Register = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const onFinish = async (values: RegisterParams) => {
    setLoading(true);
    try {
      const registerParams: RegisterParams = {
        username: values.username,
        password: values.password,
        real_name: values.real_name,
        email: values.email,
        phone: values.phone,
      };
      await userApi.register(registerParams);

      message.success('注册成功！');
      navigate('/login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <Row justify="center" align="middle" style={{ minHeight: '100vh' }}>
        <Col xs={24} sm={18} md={14} lg={10}>
          <Card className="register-card">
            <div className="register-header">
              <div className="logo">
                <CiOutlined style={{ fontSize: '32px', color: '#1890ff' }} />
                <Title level={2} style={{ margin: 0, marginLeft: '10px' }}>
                  AquaMind
                </Title>
              </div>
              <Paragraph style={{ margin: '10px 0 30px 0', color: '#666' }}>
                创建账号，开始探索水生生物世界
              </Paragraph>
            </div>

            <Form
              form={form}
              name="register"
              onFinish={onFinish}
              layout="vertical"
            >
              <Row gutter={16}>
                <Col xs={24} md={12}>
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
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="real_name"
                    label="真实姓名"
                    rules={[{ required: true, message: '请输入真实姓名！' }]}
                  >
                    <Input placeholder="请输入真实姓名" />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                name="email"
                label="邮箱"
                rules={[
                  { required: true, message: '请输入邮箱！' },
                  { type: 'email', message: '请输入有效的邮箱地址！' },
                ]}
              >
                <Input
                  prefix={<MailOutlined className="site-form-item-icon" />}
                  placeholder="请输入邮箱"
                />
              </Form.Item>

              <Form.Item
                name="phone"
                label="手机号码"
                rules={[
                  { required: true, message: '请输入手机号码！' },
                  {
                    pattern: /^1[3-9]\d{9}$/,
                    message: '请输入有效的手机号码！',
                  },
                ]}
              >
                <Input
                  prefix={<PhoneOutlined className="site-form-item-icon" />}
                  placeholder="请输入手机号码"
                />
              </Form.Item>

              <Form.Item
                name="password"
                label="密码"
                rules={[
                  { required: true, message: '请输入密码！' },
                  { min: 6, message: '密码长度不能少于6个字符！' },
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined className="site-form-item-icon" />}
                  placeholder="请输入密码"
                />
              </Form.Item>

              <Form.Item
                name="confirmPassword"
                label="确认密码"
                dependencies={['password']}
                rules={[
                  { required: true, message: '请确认密码！' },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('password') === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(
                        new Error('两次输入的密码不一致！')
                      );
                    },
                  }),
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined className="site-form-item-icon" />}
                  placeholder="请确认密码"
                />
              </Form.Item>

              {/* <Form.Item
                name="userType"
                label="用户类型"
                rules={[{ required: true, message: '请选择用户类型！' }]}
              >
                <Select placeholder="请选择用户类型">
                  <Option value="personal">个人用户</Option>
                  <Option value="researcher">科研人员</Option>
                  <Option value="institution">机构用户</Option>
                </Select>
              </Form.Item> */}

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  className="register-button"
                  block
                  loading={loading}
                >
                  注册
                </Button>
              </Form.Item>

              <Paragraph style={{ textAlign: 'center', marginTop: '20px' }}>
                已有账号？ <Link to="/login">立即登录</Link>
              </Paragraph>
            </Form>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Register;
