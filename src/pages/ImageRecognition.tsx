import { useState } from 'react';
import {
  Card,
  Row,
  Col,
  Upload,
  Button,
  message,
  Spin,
  Typography,
  Space,
} from 'antd';
import {
  UploadOutlined,
  CameraOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';
import { detectImage } from '../api/imageApi';
import './ImageRecognition.css';

const { Title, Paragraph } = Typography;
const { Dragger } = Upload;

/** 识别结果：优先展示中文名与描述 */
interface RecognitionResult {
  speciesName: string;
  description?: string | null;
}

const ImageRecognition = () => {
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [recognitionResult, setRecognitionResult] =
    useState<RecognitionResult | null>(null);

  const uploadProps = {
    name: 'file',
    multiple: false,
    beforeUpload: (file: File) => {
      const isImage = file.type.startsWith('image/');
      if (!isImage) {
        message.error('请上传图片文件！');
        return false;
      }
      const isLt2M = file.size / 1024 / 1024 < 2;
      if (!isLt2M) {
        message.error('图片大小不能超过2MB！');
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
      message.error('请先上传图片！');
      return;
    }

    setLoading(true);
    setRecognitionResult(null);

    detectImage(uploadedFile)
      .then((res) => {
        const detections = res.data?.detections ?? [];
        if (detections.length === 0) {
          setRecognitionResult({ speciesName: '未识别到物种' });
          message.info('未检测到目标物种');
          return;
        }
        // 取置信度最高的一条作为主结果
        const best = detections.reduce((a, b) =>
          a.confidence >= b.confidence ? a : b
        );
        const displayName =
          best.species_name_zh?.trim() || best.class_name;
        setRecognitionResult({
          speciesName: displayName,
          description: best.description?.trim() || null,
        });
        message.success('识别完成！');
      })
      .catch(() => {
        message.error('识别失败，请重试');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <div className="image-recognition">
      <div className="page-header">
        <Title level={3}>图像识别</Title>
        <Paragraph style={{ color: '#666' }}>
          上传水生生物图像，AI快速识别物种信息
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
                支持JPG、PNG等格式，文件大小不超过2MB
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
                  {recognitionResult.description && (
                    <p className="species-description">
                      {recognitionResult.description}
                    </p>
                  )}
                </div>
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
    </div>
  );
};

export default ImageRecognition;
