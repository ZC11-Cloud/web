import { useCallback, useEffect, useState } from 'react';
import {
  Button,
  Card,
  Form,
  Input,
  message,
  Modal,
  Popconfirm,
  Select,
  Space,
  Table,
  Tag,
  Typography,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import userApi, {
  type AdminCreateUserParams,
  type AdminUpdateUserParams,
  type AdminUserItem,
  type UserRole,
  type UserStatus,
} from '../api/userApi';

const { Title } = Typography;

type EditMode = 'create' | 'edit';

const roleLabelMap: Record<UserRole, string> = {
  0: '普通用户',
  1: '管理员',
};

const statusLabelMap: Record<UserStatus, string> = {
  0: '禁用',
  1: '启用',
};

const statusColorMap: Record<UserStatus, string> = {
  0: 'default',
  1: 'green',
};

const UserManagement = () => {
  const [list, setList] = useState<AdminUserItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [editMode, setEditMode] = useState<EditMode>('create');
  const [editingUser, setEditingUser] = useState<AdminUserItem | null>(null);
  const [form] = Form.useForm<AdminCreateUserParams & AdminUpdateUserParams>();

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await userApi.listAdminUsers({
        page,
        page_size: pageSize,
        keyword: keyword.trim() || undefined,
      });
      setList(res.data.items);
      setTotal(res.data.total);
    } finally {
      setLoading(false);
    }
  }, [keyword, page, pageSize]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const openCreateModal = () => {
    setEditMode('create');
    setEditingUser(null);
    form.resetFields();
    form.setFieldsValue({ role: 0, status: 1 });
    setModalOpen(true);
  };

  const openEditModal = (record: AdminUserItem) => {
    setEditMode('edit');
    setEditingUser(record);
    form.setFieldsValue({
      real_name: record.real_name,
      phone: record.phone,
      email: record.email,
    });
    setModalOpen(true);
  };

  const handleModalOk = async () => {
    const values = await form.validateFields();
    setModalLoading(true);
    try {
      if (editMode === 'create') {
        await userApi.createAdminUser(values as AdminCreateUserParams);
        message.success('用户创建成功');
      } else if (editingUser) {
        await userApi.updateAdminUser(editingUser.id, values as AdminUpdateUserParams);
        message.success('用户信息更新成功');
      }
      setModalOpen(false);
      fetchUsers();
    } finally {
      setModalLoading(false);
    }
  };

  const handleStatusChange = async (record: AdminUserItem, statusValue: UserStatus) => {
    await userApi.updateAdminUserStatus(record.id, { status: statusValue });
    message.success('用户状态更新成功');
    fetchUsers();
  };

  const handleRoleChange = async (record: AdminUserItem, roleValue: UserRole) => {
    await userApi.updateAdminUserRole(record.id, { role: roleValue });
    message.success('用户角色更新成功');
    fetchUsers();
  };

  const handleDelete = async (record: AdminUserItem) => {
    await userApi.deleteAdminUser(record.id);
    message.success('用户删除成功');
    if (list.length === 1 && page > 1) {
      setPage((prev) => prev - 1);
      return;
    }
    fetchUsers();
  };

  const columns: ColumnsType<AdminUserItem> = [
    {
      title: 'ID',
      dataIndex: 'id',
      width: 72,
    },
    {
      title: '用户名',
      dataIndex: 'username',
      width: 140,
    },
    {
      title: '姓名',
      dataIndex: 'real_name',
      render: (value: string | undefined) => value || '-',
    },
    {
      title: '手机号',
      dataIndex: 'phone',
      render: (value: string | undefined) => value || '-',
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      render: (value: string | undefined) => value || '-',
    },
    {
      title: '角色',
      dataIndex: 'role',
      width: 130,
      render: (role: UserRole, record) => (
        <Select
          value={role}
          style={{ width: 110 }}
          options={[
            { label: '普通用户', value: 0 },
            { label: '管理员', value: 1 },
          ]}
          onChange={(value) => handleRoleChange(record, value)}
        />
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 140,
      render: (statusValue: UserStatus, record) => (
        <Select
          value={statusValue}
          style={{ width: 110 }}
          options={[
            { label: '禁用', value: 0 },
            { label: '启用', value: 1 },
          ]}
          onChange={(value) => handleStatusChange(record, value)}
        />
      ),
    },
    {
      title: '状态标签',
      dataIndex: 'statusLabel',
      width: 110,
      render: (_, record) => (
        <Tag color={statusColorMap[record.status]}>
          {statusLabelMap[record.status]}
        </Tag>
      ),
    },
    {
      title: '操作',
      key: 'actions',
      width: 150,
      render: (_, record) => (
        <Space>
          <Button type="link" onClick={() => openEditModal(record)}>
            编辑
          </Button>
          <Popconfirm
            title="确定删除该用户吗？"
            okText="确定"
            cancelText="取消"
            onConfirm={() => handleDelete(record)}
          >
            <Button type="link" danger>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Card>
      <Space direction="vertical" style={{ width: '100%' }} size={16}>
        <Space style={{ justifyContent: 'space-between', width: '100%' }}>
          <Title level={4} style={{ margin: 0 }}>
            用户管理
          </Title>
          <Button type="primary" onClick={openCreateModal}>
            新增用户
          </Button>
        </Space>

        <Space>
          <Input.Search
            allowClear
            style={{ width: 300 }}
            placeholder="搜索用户名/姓名/邮箱/手机号"
            onSearch={(value) => {
              setKeyword(value);
              setPage(1);
            }}
          />
        </Space>

        <Table
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={list}
          pagination={{
            current: page,
            pageSize,
            total,
            showSizeChanger: true,
            showTotal: (count) => `共 ${count} 条`,
            onChange: (nextPage, nextPageSize) => {
              setPage(nextPage);
              setPageSize(nextPageSize);
            },
          }}
        />
      </Space>

      <Modal
        title={editMode === 'create' ? '新增用户' : '编辑用户'}
        open={modalOpen}
        onOk={handleModalOk}
        onCancel={() => setModalOpen(false)}
        confirmLoading={modalLoading}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{ role: 0, status: 1 }}
          preserve={false}
        >
          {editMode === 'create' && (
            <>
              <Form.Item
                name="username"
                label="用户名"
                rules={[
                  { required: true, message: '请输入用户名' },
                  { min: 3, message: '用户名至少 3 位' },
                ]}
              >
                <Input placeholder="请输入用户名" />
              </Form.Item>
              <Form.Item
                name="password"
                label="密码"
                rules={[
                  { required: true, message: '请输入密码' },
                  { min: 6, message: '密码至少 6 位' },
                ]}
              >
                <Input.Password placeholder="请输入密码" />
              </Form.Item>
              <Form.Item name="role" label="角色" rules={[{ required: true }]}>
                <Select
                  options={[
                    { label: roleLabelMap[0], value: 0 },
                    { label: roleLabelMap[1], value: 1 },
                  ]}
                />
              </Form.Item>
              <Form.Item name="status" label="状态" rules={[{ required: true }]}>
                <Select
                  options={[
                    { label: statusLabelMap[1], value: 1 },
                    { label: statusLabelMap[0], value: 0 },
                  ]}
                />
              </Form.Item>
            </>
          )}
          <Form.Item name="real_name" label="姓名">
            <Input placeholder="请输入姓名" />
          </Form.Item>
          <Form.Item
            name="phone"
            label="手机号"
            rules={[
              {
                pattern: /^1[3-9]\d{9}$/,
                message: '手机号格式不正确',
              },
            ]}
          >
            <Input placeholder="请输入手机号" />
          </Form.Item>
          <Form.Item name="email" label="邮箱" rules={[{ type: 'email', message: '邮箱格式不正确' }]}>
            <Input placeholder="请输入邮箱" />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default UserManagement;
