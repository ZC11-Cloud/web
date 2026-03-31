import React from 'react';
import { Sources } from '@ant-design/x';
import type { KnowledgeCitation } from '../../../api/qaApi';

interface SupCitationProps {
  children?: React.ReactNode;
  citations?: KnowledgeCitation[] | null;
  onSourceClick?: (sourceId: string) => void;
}

const SupCitation = React.memo((props: SupCitationProps) => {
  const { children, citations, onSourceClick } = props;
  const key = parseInt(`${children}` || '0', 10);

  if (!citations?.length) {
    return <sup>{children}</sup>;
  }

  const items = citations.map((citation) => ({
    key: citation.key,
    title: `${citation.key}. ${citation.filename}`,
    description: citation.snippet,
  }));

  return (
    <Sources
      activeKey={key}
      title={children}
      items={items}
      inline={true}
      onClick={(item) => {
        const hit = citations.find((citation) => citation.key === Number(item.key));
        if (hit?.source_id) {
          onSourceClick?.(hit.source_id);
        }
      }}
    />
  );
});

export default SupCitation;
