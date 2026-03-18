import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Typography, Spin, Button, Tag, Space, message } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useKnowledgeStore } from '../store/useKnowledgeStore';
import './KnowledgeDocumentDetail.css';

const { Title, Paragraph } = Typography;

const KnowledgeDocumentDetail = () => {
  const { sourceId } = useParams<{ sourceId: string }>();
  const navigate = useNavigate();
  const {
    currentDocument,
    detailLoading,
    detailError,
    fetchDocument,
    clearCurrentDocument,
  } = useKnowledgeStore();

  useEffect(() => {
    if (sourceId) {
      fetchDocument(sourceId);
    }
    return () => clearCurrentDocument();
  }, [sourceId, fetchDocument, clearCurrentDocument]);

  if (!sourceId) {
    message.error('缺少文档标识');
    navigate('/knowledge-base');
    return null;
  }

  if (detailLoading) {
    return (
      <div className="knowledge-document-detail">
        <div className="detail-loading">
          <Spin size="large" tip="加载中..." />
        </div>
      </div>
    );
  }

  if (detailError || !currentDocument) {
    return (
      <div className="knowledge-document-detail">
        <Button
          type="text"
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/knowledge-base')}
        >
          返回知识库
        </Button>
        <div className="detail-error">
          <Paragraph type="danger">
            {detailError || '文档不存在或已删除'}
          </Paragraph>
        </div>
      </div>
    );
  }

  return (
    <div className="knowledge-document-detail">
      <Button
        type="text"
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate('/knowledge-base')}
        style={{ marginBottom: 16 }}
      >
        返回知识库
      </Button>
      <div className="detail-content">
        <Title level={3}>{currentDocument.original_filename}</Title>
        <Space wrap style={{ marginBottom: 16 }}>
          {currentDocument.tags.map((tag, index) => (
            <Tag key={index}>{tag}</Tag>
          ))}
        </Space>
        <Paragraph style={{ whiteSpace: 'pre-wrap' }}>
          {currentDocument.summary || '暂无内容摘要'}
        </Paragraph>
        <Paragraph type="secondary" style={{ marginTop: 24 }}>
          文档 ID: {currentDocument.source_id} · 分块数: {currentDocument.chunk_count}
        </Paragraph>
      </div>
    </div>
  );
};

export default KnowledgeDocumentDetail;
