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
  Select,
  Segmented,
} from 'antd';
import type { UploadProps } from 'antd';
import {
  AppstoreOutlined,
  BarsOutlined,
  SearchOutlined,
  TagOutlined,
  UnorderedListOutlined,
  UploadOutlined,
  InboxOutlined,
} from '@ant-design/icons';
import './KnowledgeBase.css';
import { useKnowledgeStore } from '../store/useKnowledgeStore';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
const { Title, Paragraph } = Typography;
const { Search } = Input;

/** 知识库支持的扩展名（与后端一致） */
const ALLOWED_EXTENSIONS = ['.pdf', '.txt', '.md', '.docx'];
const ACCEPT = '.pdf,.txt,.md,.docx';
type KnowledgeViewMode = 'card' | 'list';

const KnowledgeBase = () => {
  const navigate = useNavigate();
  const {
    documents,
    fetchDocuments,
    tags,
    tagsLoading,
    fetchTags,
    selectedTag,
    setSelectedTag,
    uploadDocument,
    uploadLoading,
    searchQuery,
    searchResults,
    searchLoading,
    searchError,
    searchDocuments,
    clearSearch,
  } = useKnowledgeStore();
  const [uploadTags, setUploadTags] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<KnowledgeViewMode>('card');

  const tagOptions = useMemo(
    () => tags.map((tag) => ({ label: tag.name, value: tag.name })),
    [tags]
  );

  useEffect(() => {
    fetchDocuments();
    fetchTags();
  }, [fetchDocuments, fetchTags]);

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
      await uploadDocument(file as File, uploadTags);
      setUploadTags([]);
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

  const openDocument = (sourceId: string) => {
    navigate(`/knowledge-base/documents/${encodeURIComponent(sourceId)}`);
  };

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
        <Select
          mode="tags"
          allowClear
          maxCount={10}
          maxTagTextLength={20}
          value={uploadTags}
          options={tagOptions}
          loading={tagsLoading}
          placeholder="选择已有标签，或输入新标签后回车"
          onChange={(values) => {
            const cleaned = values
              .map((value) => value.trim())
              .filter(Boolean)
              .filter((value, index, arr) => arr.indexOf(value) === index)
              .slice(0, 10);
            setUploadTags(cleaned);
          }}
          style={{ width: '100%', marginBottom: 16 }}
        />
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
        <Space wrap>
          <Tag.CheckableTag
            checked={!selectedTag}
            onChange={() => {
              void setSelectedTag(null);
            }}
          >
            全部
          </Tag.CheckableTag>
          {tags.map((tag) => (
            <Tag.CheckableTag
              key={tag.name}
              checked={selectedTag === tag.name}
              onChange={() => {
                void setSelectedTag(selectedTag === tag.name ? null : tag.name);
              }}
            >
              {tag.name} ({tag.count})
            </Tag.CheckableTag>
          ))}
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
          <div className="knowledge-list-header">
            <Title level={4} style={{ margin: 0 }}>
              <UnorderedListOutlined /> {selectedTag ? `${selectedTag} 分类` : '知识列表'}
            </Title>
            <Segmented<KnowledgeViewMode>
              value={viewMode}
              onChange={setViewMode}
              options={[
                {
                  label: '卡片',
                  value: 'card',
                  icon: <AppstoreOutlined />,
                },
                {
                  label: '列表',
                  value: 'list',
                  icon: <BarsOutlined />,
                },
              ]}
            />
          </div>
          {documents.length === 0 ? (
            <Empty description={selectedTag ? '该分类下暂无知识文档' : '暂无知识文档'} />
          ) : viewMode === 'list' ? (
            <div className="knowledge-list-plain">
              {documents.map((item) => (
                <button
                  type="button"
                  key={item.source_id}
                  className="knowledge-list-row"
                  onClick={() => openDocument(item.source_id)}
                >
                  <div className="knowledge-list-main">
                    <Typography.Text className="knowledge-list-title">
                      {item.original_filename}
                    </Typography.Text>
                    <Paragraph className="knowledge-list-summary" ellipsis={{ rows: 2 }}>
                      {item.summary || '暂无简介'}
                    </Paragraph>
                  </div>
                  <div className="knowledge-list-tags">
                    {item.tags.length > 0 ? (
                      item.tags.map((tag, index) => <Tag key={index}>{tag}</Tag>)
                    ) : (
                      <Typography.Text type="secondary">暂无标签</Typography.Text>
                    )}
                  </div>
                  <div className="knowledge-list-meta">
                    <Typography.Text>Chunks: {item.chunk_count}</Typography.Text>
                    <Typography.Text type="secondary">
                      {dayjs(item.create_time).format('YYYY-MM-DD HH:mm')}
                    </Typography.Text>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <Row gutter={[16, 16]}>
              {documents.map((item) => (
              <Col xs={24} sm={12} md={8} key={item.source_id}>
                <Card
                  hoverable
                  className="knowledge-card"
                  onClick={() => openDocument(item.source_id)}
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
                    {item.tags.length > 0 && (
                      <Space wrap style={{ marginBottom: '10px' }}>
                        {item.tags.map((tag, index) => (
                          <Tag key={index}>{tag}</Tag>
                        ))}
                      </Space>
                    )}
                    {/* <div className="view-count">
                      <span>浏览量: {item.viewCount}</span>
                    </div> */}
                  </div>
                </Card>
              </Col>
              ))}
            </Row>
          )}
        </div>
      )}
    </div>
  );
};

export default KnowledgeBase;
