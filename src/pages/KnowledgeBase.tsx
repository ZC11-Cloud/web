import {
  Card,
  Row,
  Col,
  Input,
  Typography,
  Tag,
  Space,
  Divider,
} from 'antd';
import {
  SearchOutlined,
  TagOutlined,
} from '@ant-design/icons';
import './KnowledgeBase.css';

const { Title, Paragraph } = Typography;
const { Search } = Input;

interface KnowledgeItem {
  id: number;
  title: string;
  content: string;
  category: string;
  tags: string[];
  viewCount: number;
}

const KnowledgeBase = () => {
  // 模拟知识库数据
  const knowledgeData: KnowledgeItem[] = [
    {
      id: 1,
      title: '中华鲟的生物学特征与保护现状',
      content: '中华鲟是中国特有的大型溯河洄游性鱼类，属于国家一级保护动物。它们主要分布在长江流域，是地球上最古老的脊椎动物之一，有着"活化石"之称。由于水利工程建设、水域污染等因素，中华鲟的生存面临严重威胁...',
      category: '鱼类',
      tags: ['珍稀物种', '保护动物', '洄游鱼类'],
      viewCount: 1234,
    },
    {
      id: 2,
      title: '珊瑚礁生态系统的重要性',
      content: '珊瑚礁被誉为"海洋中的热带雨林"，是地球上生物多样性最丰富的生态系统之一。它们为无数海洋生物提供栖息地，保护海岸线免受海浪侵蚀，同时也是重要的旅游资源。然而，气候变化、海洋酸化等因素正在导致全球珊瑚礁大面积退化...',
      category: '海洋生态',
      tags: ['珊瑚礁', '生态系统', '生物多样性'],
      viewCount: 892,
    },
    {
      id: 3,
      title: '淡水鱼养殖技术要点',
      content: '淡水鱼养殖需要注意水质管理、饲料选择、疾病防控等关键技术。合理的养殖密度、科学的投喂策略以及定期的水质监测是保证养殖成功的重要因素。同时，环保意识也越来越重要，可持续养殖模式正在成为行业发展的趋势...',
      category: '养殖技术',
      tags: ['淡水鱼', '养殖', '技术'],
      viewCount: 567,
    },
    {
      id: 4,
      title: '海藻的营养价值与食用方法',
      content: '海藻富含蛋白质、维生素和矿物质，具有很高的营养价值和药用价值。常见的食用海藻包括海带、紫菜、裙带菜等。海藻可以凉拌、煮汤、炒菜等多种方式食用，是一种健康的海洋食品...',
      category: '藻类',
      tags: ['海藻', '营养价值', '食用方法'],
      viewCount: 789,
    },
  ];

  const onSearch = (value: string) => {
    console.log('搜索:', value);
    // 搜索功能暂不实现
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
          style={{ maxWidth: '600px' }}
        />
      </div>

      <Divider />

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

      <div className="knowledge-list">
        <Title level={4} style={{ margin: '30px 0 20px 0' }}>推荐知识</Title>
        <Row gutter={[16, 16]}>
          {knowledgeData.map((item) => (
            <Col xs={24} sm={12} md={8} key={item.id}>
              <Card hoverable className="knowledge-card">
                <div className="card-header">
                  <Tag color="blue" style={{ marginBottom: '10px' }}>{item.category}</Tag>
                  <Title level={4} style={{ margin: '10px 0' }}>{item.title}</Title>
                </div>
                <Paragraph ellipsis={{ rows: 3 }}>{item.content}</Paragraph>
                <div className="card-footer">
                  <Space wrap style={{ marginBottom: '10px' }}>
                    {item.tags.map((tag, index) => (
                      <Tag key={index}>{tag}</Tag>
                    ))}
                  </Space>
                  <div className="view-count">
                    <span>浏览量: {item.viewCount}</span>
                  </div>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      </div>
    </div>
  );
};

export default KnowledgeBase;