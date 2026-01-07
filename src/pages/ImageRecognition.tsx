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
  Tag,
  Space,
  Divider,
} from 'antd';
import {
  UploadOutlined,
  CameraOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';
import './ImageRecognition.css';

const { Title, Paragraph } = Typography;
const { Dragger } = Upload;

const ImageRecognition = () => {
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [recognitionResult, setRecognitionResult] = useState<any>(null);

  const uploadProps = {
    name: 'file',
    multiple: false,
    beforeUpload: (file: any) => {
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

      // 显示图片预览
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        setImageUrl(reader.result as string);
      };

      return false; // 阻止自动上传
    },
  };

  const handleRecognize = () => {
    if (!imageUrl) {
      message.error('请先上传图片！');
      return;
    }

    setLoading(true);

    // 模拟识别过程
    setTimeout(() => {
      // 模拟识别结果
      setRecognitionResult({
        speciesName: '中华鲟',
        scientificName: 'Acipenser sinensis',
        confidence: 0.98,
        category: '鱼类',
        description:
          '中华鲟是中国特有的大型溯河洄游性鱼类，属于国家一级保护动物，主要分布在长江流域。',
        habitat: '长江、黄河、珠江等大型河流',
        status: '极危(CR)',
        features: ['身体呈纺锤形', '吻部尖长', '体表无鳞', '有5行骨板'],
      });

      setLoading(false);
      message.success('识别完成！');
    }, 2000);
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
                  <Title level={3} style={{ marginBottom: '10px' }}>
                    {recognitionResult.speciesName}
                    <Tag color="green" style={{ marginLeft: '10px' }}>
                      {recognitionResult.confidence * 100}%
                    </Tag>
                  </Title>
                  <Paragraph style={{ margin: '5px 0', color: '#666' }}>
                    学名: {recognitionResult.scientificName}
                  </Paragraph>
                  <Paragraph style={{ margin: '5px 0', color: '#666' }}>
                    分类: {recognitionResult.category}
                  </Paragraph>
                  <Paragraph style={{ margin: '5px 0', color: '#666' }}>
                    保护状态: {recognitionResult.status}
                  </Paragraph>
                </div>

                <Divider />

                <div className="species-description">
                  <Title level={5}>
                    <InfoCircleOutlined /> 物种描述
                  </Title>
                  <Paragraph>{recognitionResult.description}</Paragraph>
                </div>

                <div className="species-details">
                  <Title level={5}>栖息地</Title>
                  <Paragraph>{recognitionResult.habitat}</Paragraph>
                </div>

                <div className="species-features">
                  <Title level={5}>主要特征</Title>
                  <ul>
                    {recognitionResult.features.map(
                      (feature: string, index: number) => (
                        <li key={index}>{feature}</li>
                      )
                    )}
                  </ul>
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
