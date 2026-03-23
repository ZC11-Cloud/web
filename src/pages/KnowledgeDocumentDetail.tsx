import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { renderAsync } from 'docx-preview';
import { Typography, Spin, Button, Tag, Space, message } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useKnowledgeStore } from '../store/useKnowledgeStore';
import knowledgeApi from '../api/knowledgeApi';
import './KnowledgeDocumentDetail.css';

const { Title, Paragraph } = Typography;

const KnowledgeDocumentDetail = () => {
  const { sourceId } = useParams<{ sourceId: string }>();
  const navigate = useNavigate();
  const {
    currentDocument,
    detailLoading,
    detailError,
    documentContent,
    contentLoading,
    contentError,
    fetchDocument,
    fetchDocumentContent,
    clearCurrentDocument,
  } = useKnowledgeStore();
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [docxBlob, setDocxBlob] = useState<Blob | null>(null);
  const [docxLoading, setDocxLoading] = useState(false);
  const [docxError, setDocxError] = useState<string | null>(null);
  const docxContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (sourceId) {
      fetchDocument(sourceId);
    }
    return () => clearCurrentDocument();
  }, [sourceId, fetchDocument, clearCurrentDocument]);

  useEffect(() => {
    const loadDocumentBody = async () => {
      if (!sourceId || !currentDocument) return;
      const name = currentDocument.original_filename.toLowerCase();
      const isPdf = name.endsWith('.pdf');
      const isDocx = name.endsWith('.docx');
      if (isPdf) {
        setDocxBlob(null);
        setDocxError(null);
        setPdfLoading(true);
        setPdfError(null);
        if (pdfBlobUrl) {
          URL.revokeObjectURL(pdfBlobUrl);
          setPdfBlobUrl(null);
        }
        try {
          const blob = await knowledgeApi.downloadDocument(sourceId);
          const url = URL.createObjectURL(blob);
          setPdfBlobUrl(url);
        } catch (err) {
          setPdfError(err instanceof Error ? err.message : 'PDF 预览加载失败');
        } finally {
          setPdfLoading(false);
        }
        return;
      }
      if (isDocx) {
        setPdfError(null);
        if (pdfBlobUrl) {
          URL.revokeObjectURL(pdfBlobUrl);
          setPdfBlobUrl(null);
        }
        setDocxBlob(null);
        setDocxLoading(true);
        setDocxError(null);
        try {
          const blob = await knowledgeApi.downloadDocument(sourceId);
          setDocxBlob(blob);
        } catch (err) {
          setDocxError(err instanceof Error ? err.message : 'Word 文档加载失败');
        } finally {
          setDocxLoading(false);
        }
        return;
      }
      setPdfError(null);
      setDocxBlob(null);
      setDocxError(null);
      if (pdfBlobUrl) {
        URL.revokeObjectURL(pdfBlobUrl);
        setPdfBlobUrl(null);
      }
      fetchDocumentContent(sourceId);
    }
    loadDocumentBody();
  }, [sourceId, currentDocument, fetchDocumentContent]);

  useLayoutEffect(() => {
    const el = docxContainerRef.current;
    if (!docxBlob || !el) return;
    const name = currentDocument?.original_filename.toLowerCase() ?? '';
    if (!name.endsWith('.docx')) return;

    let cancelled = false;
    el.innerHTML = '';
    renderAsync(docxBlob, el, undefined, {
      className: 'docx-preview-root',
      inWrapper: true,
      ignoreWidth: false,
      ignoreHeight: false,
      ignoreFonts: false,
      breakPages: true,
    }).catch((err) => {
      if (!cancelled) {
        setDocxError(err instanceof Error ? err.message : 'Word 文档渲染失败');
      }
    });

    return () => {
      cancelled = true;
      el.innerHTML = '';
    };
  }, [docxBlob, currentDocument?.original_filename]);

  useEffect(() => {
    return () => {
      if (pdfBlobUrl) {
        URL.revokeObjectURL(pdfBlobUrl);
      }
    };
  }, [pdfBlobUrl]);

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

  const isMarkdown =
    currentDocument.original_filename.toLowerCase().endsWith('.md');
  const isPdf = currentDocument.original_filename.toLowerCase().endsWith('.pdf');
  const isDocx = currentDocument.original_filename.toLowerCase().endsWith('.docx');

  return (
    <div
      className={`knowledge-document-detail${isDocx ? ' docx-reading' : ''}`}
    >
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
        {isPdf ? (
          pdfLoading ? (
            <div className="detail-content-loading">
              <Spin tip="加载 PDF 预览..." />
            </div>
          ) : pdfError ? (
            <Paragraph type="danger">{pdfError}</Paragraph>
          ) : pdfBlobUrl ? (
            <div className="pdf-preview-wrapper">
              <iframe
                className="pdf-preview-frame"
                src={pdfBlobUrl}
                title={currentDocument.original_filename}
              />
            </div>
          ) : (
            <Paragraph type="secondary">暂无 PDF 预览内容</Paragraph>
          )
        ) : isDocx ? (
          docxLoading ? (
            <div className="detail-content-loading">
              <Spin tip="加载 Word 文档..." />
            </div>
          ) : docxError ? (
            <Paragraph type="danger">{docxError}</Paragraph>
          ) : (
            <div className="docx-preview-wrapper">
              <div
                ref={docxContainerRef}
                className="docx-preview-mount"
                aria-label="Word 文档预览"
              />
            </div>
          )
        ) : contentLoading ? (
          <div className="detail-content-loading">
            <Spin tip="加载正文..." />
          </div>
        ) : contentError ? (
          <Paragraph type="danger">{contentError}</Paragraph>
        ) : documentContent ? (
          isMarkdown ? (
            <div className="detail-content-body markdown-body">
              <ReactMarkdown>{documentContent}</ReactMarkdown>
            </div>
          ) : (
            <Paragraph style={{ whiteSpace: 'pre-wrap' }} className="detail-content-body">
              {documentContent}
            </Paragraph>
          )
        ) : (
          <Paragraph type="secondary">暂无正文内容</Paragraph>
        )}
        <Paragraph type="secondary" style={{ marginTop: 24 }}>
          文档 ID: {currentDocument.source_id} · 分块数: {currentDocument.chunk_count}
        </Paragraph>
      </div>
    </div>
  );
};

export default KnowledgeDocumentDetail;
