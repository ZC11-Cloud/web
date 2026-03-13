import type { ThoughtChainProps } from '@ant-design/x';
import { ThoughtChain } from '@ant-design/x';

export const defaultThoughtItems: ThoughtChainProps['items'] = [
  {
    title: '知识检索',
    description: '查询知识库信息',
  },
  {
    title: '调用网络搜索工具',
    description: '触发外部工具调用',
  },
  {
    title: '模型推理完成',
    description: '调用大模型生成回复',
  },
  {
    title: '响应完成',
    description: '任务处理结束并返回结果',
    blink: true,
  },
];

export interface ThoughtChainPanelProps {
  items?: ThoughtChainProps['items'];
  className?: string;
}

const ThoughtChainPanel: React.FC<ThoughtChainPanelProps> = ({
  items,
  className,
}) => {
  return (
    <div className={className}>
      <ThoughtChain items={items ?? defaultThoughtItems} />
    </div>
  );
};

export default ThoughtChainPanel;

