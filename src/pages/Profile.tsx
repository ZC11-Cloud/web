import { useState, useEffect } from 'react';
import { Card, Form, Input, Button, Avatar, Space, message } from 'antd';
import {
  UserOutlined,
  EditOutlined,
  SaveOutlined,
} from '@ant-design/icons';
import './Profile.css';
import { useUserStore } from '../store/useUserStore';
import userApi from '../api/userApi';

const Profile = () => {
  const [form] = Form.useForm();
  const [isEditing, setIsEditing] = useState(false);
  const { user, updateUserInfo } = useUserStore();

  useEffect(() => {
    if (user) {
      form.setFieldsValue(user);
    }
  }, [user, form]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    if (user) {
      form.setFieldsValue(user);
    }
  };

  const handleSave = async (values: any) => {
    try {
      // 这里应该调用API更新用户信息
      // await userApi.updateUserInfo(values);
      updateUserInfo(values);
      setIsEditing(false);
      message.success('用户信息更新成功！');
    } catch (error) {
      message.error('用户信息更新失败，请稍后重试！');
    }
  };

  return (
    <div className="profile-container">
      <Card title="个人中心" className="profile-card">
        <div className="profile-header">
          <Avatar
            size={128}
            icon={<UserOutlined />}
            className="profile-avatar"
          />
          <h2 className="profile-username">{user?.username}</h2>
        </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSave}
          className="profile-form"
        >
          <Form.Item
            name="real_name"
            label="真实姓名"
            rules={[{ required: true, message: '请输入真实姓名' }]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="请输入真实姓名"
              disabled={!isEditing}
            />
          </Form.Item>

          <Form.Item
            name="email"
            label="邮箱"
            rules={[
              { required: true, message: '请输入邮箱' },
              { type: 'email', message: '请输入有效的邮箱地址' },
            ]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="请输入邮箱"
              disabled={!isEditing}
            />
          </Form.Item>

          <Form.Item
            name="phone"
            label="手机号码"
            rules={[
              { required: true, message: '请输入手机号码' },
              { pattern: /^1[3-9]\d{9}$/, message: '请输入有效的手机号码' },
            ]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="请输入手机号码"
              disabled={!isEditing}
            />
          </Form.Item>

          <Form.Item name="role" label="用户角色">
            <Input prefix={<UserOutlined />} disabled />
          </Form.Item>

          <Form.Item name="status" label="账号状态">
            <Input prefix={<UserOutlined />} disabled />
          </Form.Item>

          <Form.Item className="profile-form-actions">
            <Space>
              {!isEditing ? (
                <Button
                  type="primary"
                  icon={<EditOutlined />}
                  onClick={handleEdit}
                >
                  编辑信息
                </Button>
              ) : (
                <>
                  <Button
                    type="primary"
                    icon={<SaveOutlined />}
                    htmlType="submit"
                  >
                    保存
                  </Button>
                  <Button icon={<SaveOutlined />} onClick={handleCancel}>
                    取消
                  </Button>
                </>
              )}
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default Profile;
