import {
  Card,
  Row,
  Col,
  Input,
  Typography,
  Tag,
  Space,
  Divider,
  message,
  Upload,
  Spin,
  Empty,
  Alert,
  Button,
} from 'antd';
import type { UploadProps } from 'antd';
import {
  SearchOutlined,
  TagOutlined,
  FireOutlined,
  UploadOutlined,
  InboxOutlined,
} from '@ant-design/icons';
import './KnowledgeBase.css';
import { useKnowledgeStore } from '../store/useKnowledgeStore';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
const { Title, Paragraph } = Typography;
const { Search } = Input;

/** 知识库支持的扩展名（与后端一致） */
const ALLOWED_EXTENSIONS = ['.pdf', '.txt', '.md'];
const ACCEPT = '.pdf,.txt,.md';

const KnowledgeBase = () => {
  const navigate = useNavigate();
  const {
    documents,
    fetchDocuments,
    uploadDocument,
    uploadLoading,
    searchQuery,
    searchResults,
    searchLoading,
    searchError,
    searchDocuments,
    clearSearch,
  } = useKnowledgeStore();
  useEffect(() => {
    fetchDocuments();
  }, []);

  const onSearch = (value: string) => {
    const v = value.trim();
    if (!v) {
      clearSearch();
      return;
    }
    searchDocuments(v);
  };

  const customRequest: UploadProps['customRequest'] = async (options) => {
    const { file, onSuccess, onError } = options;
    try {
      await uploadDocument(file as File);
      onSuccess?.(null);
    } catch {
      onError?.(new Error('上传失败'));
    }
  };

  const beforeUpload = (file: File) => {
    const ext = '.' + (file.name.split('.').pop()?.toLowerCase() ?? '');
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      message.error(`仅支持 ${ACCEPT} 格式`);
      return Upload.LIST_IGNORE;
    }
    return true;
  };

  const { Dragger } = Upload;


  return (
    <div className="knowledge-base">
      <div className="page-header">
        <Title level={3}>水生生物知识库</Title>
        <Paragraph style={{ color: '#666' }}>
          丰富的水生生物知识资源，助力您探索海洋世界
        </Paragraph>
      </div>

      <div className="search-section">
        <Search
          placeholder="搜索知识库内容..."
          allowClear
          enterButton={<SearchOutlined />}
          size="large"
          onSearch={onSearch}
          onChange={(e) => {
            if (!e.target.value.trim()) {
              clearSearch();
            }
          }}
          style={{ maxWidth: '600px' }}
        />
      </div>

      <Divider />
      <div className="knowledge-upload">
        <Title level={4} style={{ marginBottom: '16px' }}>
          <UploadOutlined /> 上传知识
        </Title>
        <Dragger
          name="file"
          multiple
          accept={ACCEPT}
          disabled={uploadLoading}
          beforeUpload={beforeUpload}
          customRequest={customRequest}
          showUploadList={{ showRemoveIcon: false }}
          onChange={(info) => {
            if (info.file.status === 'done') {
              message.success(`${info.file.name} 上传成功`);
            } else if (info.file.status === 'error') {
              message.error(
                info.file.error?.message || `${info.file.name} 上传失败`
              );
            }
          }}
        >
          <p className="ant-upload-drag-icon">
            <InboxOutlined />
          </p>
          <p className="ant-upload-text">点击或拖拽文件到此区域上传</p>
          <p className="ant-upload-hint">
            支持单个或批量上传。请勿上传涉密或违规文件。
          </p>
        </Dragger>
      </div>
      <div className="category-section">
        <Title level={4} style={{ marginBottom: '16px' }}>
          <TagOutlined /> 知识分类
        </Title>
        <Space>
          <Tag color="blue">鱼类</Tag>
          <Tag color="green">藻类</Tag>
          <Tag color="orange">贝类</Tag>
          <Tag color="purple">海洋生态</Tag>
          <Tag color="red">保护动物</Tag>
          <Tag color="cyan">养殖技术</Tag>
        </Space>
      </div>

      {searchQuery ? (
        <div className="knowledge-list">
          <Title level={4} style={{ margin: '30px 0 20px 0' }}>
            <SearchOutlined /> 搜索结果（{searchResults.length}）
          </Title>
          <Space style={{ marginBottom: 16 }}>
            <Tag color="processing">关键词：{searchQuery}</Tag>
            <Button type="link" onClick={clearSearch}>
              清空搜索
            </Button>
          </Space>
          {searchError && (
            <Alert
              type="error"
              showIcon
              message={searchError}
              style={{ marginBottom: 16 }}
            />
          )}
          {searchLoading ? (
            <div className="search-loading">
              <Spin tip="正在搜索..." />
            </div>
          ) : searchResults.length === 0 ? (
            <Empty description="未找到相关内容" />
          ) : (
            <Row gutter={[16, 16]}>
              {searchResults.map((item, index) => (
                <Col xs={24} key={`${item.source_id}_${index}`}>
                  <Card
                    hoverable
                    className="knowledge-card"
                    onClick={() =>
                      navigate(
                        `/knowledge-base/documents/${encodeURIComponent(item.source_id)}`
                      )
                    }
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="card-header">
                      <Title level={5} style={{ margin: '10px 0' }}>
                        {item.original_filename}
                      </Title>
                      {item.score !== null && (
                        <Tag color="blue">相似度分值: {item.score.toFixed(4)}</Tag>
                      )}
                    </div>
                    <Paragraph className="search-hit-content" ellipsis={{ rows: 4 }}>
                      {item.content}
                    </Paragraph>
                  </Card>
                </Col>
              ))}
            </Row>
          )}
        </div>
      ) : (
        <div className="knowledge-list">
          <Title level={4} style={{ margin: '30px 0 20px 0' }}>
            <FireOutlined /> 推荐知识
          </Title>
          <Row gutter={[16, 16]}>
            {documents.map((item) => (
              <Col xs={24} sm={12} md={8} key={item.source_id}>
                <Card
                  hoverable
                  className="knowledge-card"
                  onClick={() =>
                    navigate(
                      `/knowledge-base/documents/${encodeURIComponent(item.source_id)}`
                    )
                  }
                  style={{ cursor: 'pointer' }}
                >
                  <div className="card-header">
                    {/* <Tag color="blue" style={{ marginBottom: '10px' }}>
                      {item.category}
                    </Tag> */}
                    <Title level={4} style={{ margin: '10px 0' }}>
                      {item.original_filename.split('.')[0]}
                    </Title>
                  </div>
                  <Paragraph ellipsis={{ rows: 3 }}>{item.summary}</Paragraph>
                  <div className="card-footer">
                    <Space wrap style={{ marginBottom: '10px' }}>
                      {item.tags.map((tag, index) => (
                        <Tag key={index}>{tag}</Tag>
                      ))}
                    </Space>
                    {/* <div className="view-count">
                      <span>浏览量: {item.viewCount}</span>
                    </div> */}
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      )}
    </div>
  );
};

export default KnowledgeBase;
