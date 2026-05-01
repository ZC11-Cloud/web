import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Card,
  Descriptions,
  Divider,
  Empty,
  List,
  Pagination,
  Row,
  Col,
  Upload,
  Button,
  message,
  Spin,
  Tag,
  Typography,
  Space,
} from 'antd';
import {
  DeleteOutlined,
  UploadOutlined,
  CameraOutlined,
  InfoCircleOutlined,
  HistoryOutlined,
} from '@ant-design/icons';
import {
  deleteDetectionHistory,
  detectImage,
  getCurrentDetectionModel,
  getDetectionHistory,
  type CurrentModelInfo,
  type DetectionHistoryItem,
  type DetectionItem,
  uploadDetectionModel,
} from '../api/imageApi';
import './ImageRecognition.css';

const { Title, Paragraph } = Typography;
const { Dragger } = Upload;
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');

/** 识别结果：优先展示中文名、置信度与描述 */
interface RecognitionResult {
  speciesName: string;
  confidence?: number;
  description?: string | null;
  detections: DetectionItem[];
  annotatedImageUrl?: string | null;
  originalImageUrl?: string | null;
}

const ImageRecognition = () => {
  const [messageApi, contextHolder] = message.useMessage();
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [recognitionResult, setRecognitionResult] =
    useState<RecognitionResult | null>(null);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyRecords, setHistoryRecords] = useState<DetectionHistoryItem[]>([]);
  const [historyTotal, setHistoryTotal] = useState(0);
  const [historyPage, setHistoryPage] = useState(1);
  const [historyPageSize, setHistoryPageSize] = useState(6);
  const [selectedHistory, setSelectedHistory] = useState<DetectionHistoryItem | null>(null);
  const [modelFile, setModelFile] = useState<File | null>(null);
  const [uploadingModel, setUploadingModel] = useState(false);
  const [currentModel, setCurrentModel] = useState<CurrentModelInfo | null>(null);
  const [modelLoading, setModelLoading] = useState(false);

  const toAbsoluteUrl = useCallback((url?: string | null) => {
    if (!url) {
      return null;
    }
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
      return url;
    }
    return `${API_BASE_URL}${url}`;
  }, []);

  const fetchHistory = useCallback(
    async (page = historyPage, pageSize = historyPageSize) => {
      setHistoryLoading(true);
      try {
        const res = await getDetectionHistory({ page, page_size: pageSize });
        const records = res.data?.records ?? [];
        setHistoryRecords(records);
        setHistoryTotal(res.data?.total ?? 0);
        setSelectedHistory((prev) => {
          if (records.length === 0) {
            return null;
          }
          if (!prev) {
            return records[0];
          }
          return records.find((item) => item.id === prev.id) || records[0];
        });
      } catch {
        messageApi.error('加载识别历史失败');
      } finally {
        setHistoryLoading(false);
      }
    },
    [historyPage, historyPageSize, messageApi]
  );

  const fetchCurrentModel = useCallback(async () => {
    setModelLoading(true);
    try {
      const res = await getCurrentDetectionModel();
      setCurrentModel(res.data ?? null);
    } catch {
      messageApi.error('获取当前模型信息失败');
    } finally {
      setModelLoading(false);
    }
  }, [messageApi]);

  useEffect(() => {
    fetchCurrentModel();
  }, [fetchCurrentModel]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory, historyPage, historyPageSize]);

  const uploadProps = {
    name: 'file',
    multiple: false,
    beforeUpload: (file: File) => {
      const isImage = file.type.startsWith('image/');
      if (!isImage) {
        messageApi.error('请上传图片文件！');
        return false;
      }
      const isLt20M = file.size / 1024 / 1024 < 20;
      if (!isLt20M) {
        messageApi.error('图片大小不能超过20MB！');
        return false;
      }

      setUploadedFile(file);
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        setImageUrl(reader.result as string);
      };

      return false; // 阻止自动上传
    },
  };

  const handleRecognize = () => {
    if (!uploadedFile) {
      messageApi.error('请先上传图片！');
      return;
    }

    setLoading(true);
    setRecognitionResult(null);

    detectImage(uploadedFile)
      .then((res) => {
        const detections = res.data?.detections ?? [];
        if (detections.length === 0) {
          setRecognitionResult({
            speciesName: '未识别到物种',
            detections: [],
            annotatedImageUrl: res.data?.annotated_image_url,
            originalImageUrl: res.data?.original_image_url,
          });
          messageApi.info('未检测到目标物种');
          return;
        }
        const best = detections.reduce((a, b) =>
          a.confidence >= b.confidence ? a : b
        );
        const displayName =
          best.species_name_zh?.trim() || best.class_name;
        setRecognitionResult({
          speciesName: displayName,
          confidence: best.confidence,
          description: best.description?.trim() || null,
          detections,
          annotatedImageUrl: res.data?.annotated_image_url,
          originalImageUrl: res.data?.original_image_url,
        });
        setHistoryPage(1);
        void fetchHistory(1, historyPageSize);
        messageApi.success('识别完成！');
      })
      .catch(() => {
        messageApi.error('识别失败，请重试');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleDeleteHistory = async (id: number) => {
    try {
      await deleteDetectionHistory(id);
      messageApi.success('历史记录已删除');
      const nextPage = historyRecords.length === 1 && historyPage > 1 ? historyPage - 1 : historyPage;
      setHistoryPage(nextPage);
      void fetchHistory(nextPage, historyPageSize);
      if (selectedHistory?.id === id) {
        setSelectedHistory(null);
      }
    } catch {
      messageApi.error('删除历史记录失败');
    }
  };

  const handleUploadModel = async () => {
    if (!modelFile) {
      messageApi.error('请先选择模型权重文件');
      return;
    }
    setUploadingModel(true);
    try {
      const res = await uploadDetectionModel(modelFile);
      setCurrentModel(res.data);
      setModelFile(null);
      messageApi.success('模型上传成功，已切换为默认模型');
    } catch {
      messageApi.error('模型上传失败，请检查权重文件');
    } finally {
      setUploadingModel(false);
    }
  };

  const annotatedPreviewUrl = useMemo(
    () => toAbsoluteUrl(recognitionResult?.annotatedImageUrl),
    [recognitionResult?.annotatedImageUrl, toAbsoluteUrl]
  );

  return (
    <div className="image-recognition">
      {contextHolder}
      <div className="page-header">
        <Title level={3}>图像识别</Title>
        <Paragraph style={{ color: '#666' }}>
          上传水生生物图像进行识别，支持查看标注图、历史记录和模型切换
        </Paragraph>
      </div>

      <Row gutter={[32, 32]} align="top">
        <Col xs={24} md={12}>
          <Card title="上传图片" className="upload-card">
            <Dragger {...uploadProps}>
              <p className="ant-upload-drag-icon">
                <UploadOutlined
                  style={{ fontSize: '48px', color: '#1890ff' }}
                />
              </p>
              <p className="ant-upload-text">点击或拖拽文件到此处上传</p>
              <p className="ant-upload-hint">
                支持JPG、PNG等格式，文件大小不超过20MB
              </p>
            </Dragger>

            {imageUrl && (
              <div className="image-preview">
                <Title level={5} style={{ margin: '20px 0 10px 0' }}>
                  图片预览
                </Title>
                <img
                  src={imageUrl}
                  alt="预览"
                  style={{ width: '100%', borderRadius: 8 }}
                />
              </div>
            )}

            <Space style={{ width: '100%', marginTop: '20px' }}>
              <Button
                type="primary"
                icon={<CameraOutlined />}
                onClick={handleRecognize}
                loading={loading}
                block
              >
                开始识别
              </Button>
              <Button
                onClick={() => {
                  setUploadedFile(null);
                  setImageUrl(null);
                  setRecognitionResult(null);
                }}
                block
              >
                重新上传
              </Button>
            </Space>
          </Card>

          <Card title="模型管理" className="model-card">
            <Space direction="vertical" style={{ width: '100%' }} size={16}>
              {modelLoading ? (
                <Spin />
              ) : currentModel ? (
                <Descriptions size="small" column={1} bordered>
                  <Descriptions.Item label="当前模型">
                    {currentModel.weights_name}
                  </Descriptions.Item>
                  <Descriptions.Item label="更新时间">
                    {currentModel.updated_at
                      ? new Date(currentModel.updated_at).toLocaleString()
                      : '未知'}
                  </Descriptions.Item>
                </Descriptions>
              ) : (
                <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无模型信息" />
              )}

              <Dragger
                name="weights"
                maxCount={1}
                beforeUpload={(file) => {
                  const ext = file.name.split('.').pop()?.toLowerCase();
                  if (ext !== 'pt') {
                    messageApi.error('仅支持上传 .pt 权重文件');
                    return false;
                  }
                  setModelFile(file);
                  return false;
                }}
                onRemove={() => {
                  setModelFile(null);
                }}
              >
                <p className="ant-upload-text">拖拽或点击选择模型权重文件</p>
                <p className="ant-upload-hint">上传后会立即替换默认识别模型</p>
              </Dragger>
              <Button
                type="primary"
                loading={uploadingModel}
                onClick={handleUploadModel}
                block
              >
                上传并启用模型
              </Button>
            </Space>
          </Card>
        </Col>

        <Col xs={24} md={12}>
          <Card title="识别结果" className="result-card">
            {loading ? (
              <div className="loading-container">
                <Spin size="large" />
                <Paragraph style={{ marginTop: '20px' }}>
                  正在识别中...
                </Paragraph>
              </div>
            ) : recognitionResult ? (
              <div className="result-content">
                <div className="species-info">
                  <div className="species-name">{recognitionResult.speciesName}</div>
                  {recognitionResult.confidence != null && (
                    <div className="species-confidence">
                      置信度：{(recognitionResult.confidence * 100).toFixed(1)}%
                    </div>
                  )}
                  {recognitionResult.description && (
                    <p className="species-description">
                      {recognitionResult.description}
                    </p>
                  )}
                </div>

                <Divider />
                <Title level={5}>识别标注图</Title>
                {annotatedPreviewUrl ? (
                  <img
                    src={annotatedPreviewUrl}
                    alt="标注图"
                    className="annotated-image"
                  />
                ) : (
                  <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无标注图" />
                )}

                {recognitionResult.detections.length > 0 && (
                  <>
                    <Divider />
                    <Title level={5}>检测框详情</Title>
                    <List
                      size="small"
                      bordered
                      dataSource={recognitionResult.detections}
                      renderItem={(item) => (
                        <List.Item>
                          <Space direction="vertical" size={0}>
                            <span>
                              {(item.species_name_zh?.trim() || item.class_name) as string}
                              <Tag color="blue" style={{ marginLeft: 8 }}>
                                {(item.confidence * 100).toFixed(1)}%
                              </Tag>
                            </span>
                            <span className="bbox-text">
                              bbox: [{item.bbox.map((value) => value.toFixed(1)).join(', ')}]
                            </span>
                          </Space>
                        </List.Item>
                      )}
                    />
                  </>
                )}
              </div>
            ) : (
              <div className="empty-result">
                <InfoCircleOutlined
                  style={{
                    fontSize: '64px',
                    color: '#ccc',
                    marginBottom: '20px',
                  }}
                />
                <Paragraph style={{ color: '#666' }}>
                  上传图片后点击"开始识别"查看结果
                </Paragraph>
              </div>
            )}
          </Card>
        </Col>
      </Row>

      <Card
        title={(
          <Space>
            <HistoryOutlined />
            识别历史
          </Space>
        )}
        className="history-card"
      >
        <Row gutter={[24, 24]}>
          <Col xs={24} md={12}>
            <Spin spinning={historyLoading}>
              <List
                locale={{ emptyText: '暂无识别历史' }}
                dataSource={historyRecords}
                renderItem={(item) => (
                  <List.Item
                    className={selectedHistory?.id === item.id ? 'history-item selected' : 'history-item'}
                    actions={[
                      <Button
                        key="delete"
                        danger
                        type="text"
                        icon={<DeleteOutlined />}
                        onClick={() => {
                          void handleDeleteHistory(item.id);
                        }}
                      >
                        删除
                      </Button>,
                    ]}
                    onClick={() => {
                      setSelectedHistory(item);
                    }}
                  >
                    <List.Item.Meta
                      title={item.top_species_name || '未识别到物种'}
                      description={new Date(item.create_time).toLocaleString()}
                    />
                  </List.Item>
                )}
              />
            </Spin>
            <div className="history-pagination">
              <Pagination
                size="small"
                current={historyPage}
                pageSize={historyPageSize}
                total={historyTotal}
                onChange={(page, pageSize) => {
                  setHistoryPage(page);
                  setHistoryPageSize(pageSize);
                }}
                showSizeChanger
              />
            </div>
          </Col>
          <Col xs={24} md={12}>
            {selectedHistory ? (
              <div className="history-detail">
                <Title level={5}>历史详情</Title>
                <Paragraph>
                  识别时间：{new Date(selectedHistory.create_time).toLocaleString()}
                </Paragraph>
                <Paragraph>
                  主结果：{selectedHistory.top_species_name || '未识别到物种'}
                  {selectedHistory.top_confidence != null && (
                    <Tag color="processing" style={{ marginLeft: 8 }}>
                      {(selectedHistory.top_confidence * 100).toFixed(1)}%
                    </Tag>
                  )}
                </Paragraph>

                <div className="history-images">
                  <div>
                    <Paragraph>
                      <strong>原图</strong>
                    </Paragraph>
                    {selectedHistory.original_image_url ? (
                      <img
                        src={toAbsoluteUrl(selectedHistory.original_image_url) || ''}
                        alt="历史原图"
                        className="history-image"
                      />
                    ) : (
                      <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="无原图" />
                    )}
                  </div>
                  <div>
                    <Paragraph>
                      <strong>标注图</strong>
                    </Paragraph>
                    {selectedHistory.annotated_image_url ? (
                      <img
                        src={toAbsoluteUrl(selectedHistory.annotated_image_url) || ''}
                        alt="历史标注图"
                        className="history-image"
                      />
                    ) : (
                      <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="无标注图" />
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="选择左侧历史记录查看详情" />
            )}
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default ImageRecognition;
