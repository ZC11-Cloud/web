import { Button, Flex } from 'antd';
import { Attachments, Sender } from '@ant-design/x';
import type { AttachmentsProps } from '@ant-design/x';
import type { RefObject } from 'react';
import { BookOutlined, CloudUploadOutlined, OpenAIOutlined, PaperClipOutlined, PictureOutlined } from '@ant-design/icons';
import type { GetProp, GetRef } from 'antd';

const SenderSwitch = Sender.Switch;

interface ChatSenderPanelProps {
  senderRef: RefObject<GetRef<typeof Sender> | null>;
  attachmentsRef: RefObject<GetRef<typeof Attachments> | null>;
  attachmentsOpen: boolean;
  onAttachmentsOpenChange: (open: boolean) => void;
  attachmentItems: GetProp<AttachmentsProps, 'items'>;
  onAttachmentItemsChange: (fileList: GetProp<AttachmentsProps, 'items'>) => void;
  inputValue: string;
  onInputChange: (value: string) => void;
  isStreaming: boolean;
  onSubmit: (text: string) => Promise<void>;
  onCancel: () => void;
  onPasteFiles: (files: FileList | File[]) => void;
  placeholder: string;
  useDeepSearch: boolean;
  onUseDeepSearchChange: (checked: boolean) => void;
  useRag: boolean;
  onUseRagChange: (checked: boolean) => void;
  useImage: boolean;
  onUseImageChange: (checked: boolean) => void;
}

const ChatSenderPanel = (props: ChatSenderPanelProps) => {
  const {
    senderRef,
    attachmentsRef,
    attachmentsOpen,
    onAttachmentsOpenChange,
    attachmentItems,
    onAttachmentItemsChange,
    inputValue,
    onInputChange,
    isStreaming,
    onSubmit,
    onCancel,
    onPasteFiles,
    placeholder,
    useDeepSearch,
    onUseDeepSearchChange,
    useRag,
    onUseRagChange,
    useImage,
    onUseImageChange,
  } = props;

  const senderHeader = (
    <Sender.Header
      title="附件"
      styles={{ content: { padding: 0 } }}
      open={attachmentsOpen}
      onOpenChange={onAttachmentsOpenChange}
      forceRender
    >
      <Attachments
        ref={attachmentsRef}
        beforeUpload={() => false}
        items={attachmentItems}
        onChange={({ fileList }) => {
          onAttachmentItemsChange(fileList ?? []);
        }}
        placeholder={(type) =>
          type === 'drop'
            ? { title: '将文件拖放到此处' }
            : {
                icon: <CloudUploadOutlined />,
                title: '上传文件',
                description: '点击或拖拽文件到此处上传',
              }
        }
        getDropContainer={() => senderRef.current?.nativeElement}
      />
    </Sender.Header>
  );

  return (
    <Sender
      ref={senderRef}
      header={senderHeader}
      loading={isStreaming}
      prefix={
        <Button
          type="text"
          style={{ fontSize: 16 }}
          icon={<PaperClipOutlined />}
          onClick={() => onAttachmentsOpenChange(!attachmentsOpen)}
        />
      }
      value={inputValue}
      onPasteFile={(files) => {
        onPasteFiles(files);
      }}
      onSubmit={onSubmit}
      onCancel={onCancel}
      disabled={false}
      placeholder={placeholder}
      onChange={onInputChange}
      footer={() => (
        <Flex justify="space-between" align="center">
          <Flex gap="small" align="center">
            <SenderSwitch
              value={useDeepSearch}
              icon={<OpenAIOutlined />}
              checkedChildren="深度思考"
              unCheckedChildren="深度思考"
              onChange={onUseDeepSearchChange}
            />
            <SenderSwitch
              value={useRag}
              icon={<BookOutlined />}
              checkedChildren="知识库"
              unCheckedChildren="知识库"
              onChange={onUseRagChange}
            />
            <SenderSwitch
              value={useImage}
              icon={<PictureOutlined />}
              checkedChildren="图像识别"
              unCheckedChildren="图像识别"
              onChange={onUseImageChange}
            />
          </Flex>
        </Flex>
      )}
      allowSpeech={true}
    />
  );
};

export default ChatSenderPanel;
