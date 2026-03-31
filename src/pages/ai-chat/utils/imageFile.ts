import type { AttachmentsProps } from '@ant-design/x';
import type { GetProp } from 'antd';

const MAX_IMAGE_SIZE_MB = 5;

export const getFirstImageFile = (
  fileList: GetProp<AttachmentsProps, 'items'>
): File | null => {
  const imageItem = fileList?.find((file) =>
    (file.originFileObj as File | undefined)?.type?.startsWith?.('image/')
  );
  return (imageItem?.originFileObj as File | undefined) ?? null;
};

export const validateImageSize = (file: File): boolean => {
  return file.size / 1024 / 1024 < MAX_IMAGE_SIZE_MB;
};

export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const raw = dataUrl.includes(',') ? dataUrl.split(',')[1] : dataUrl;
      resolve((raw ?? '').replace(/\s/g, ''));
    };
    reader.onerror = () => {
      reject(new Error('读取图片失败'));
    };
    reader.readAsDataURL(file);
  });
};
