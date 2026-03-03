import axiosInstance from './axiosInstance';

/** 单条检测结果（与后端 DetectionItem 一致） */
export interface DetectionItem {
  class_name: string;
  class_id: number;
  confidence: number;
  bbox: number[];
}

/** 检测接口响应 data 结构 */
export interface DetectionResponseData {
  detections: DetectionItem[];
  count: number;
}

/** 调用 detect 后 axios 拦截器返回的完整响应体 */
export interface DetectImageResponse {
  result: string;
  code: number;
  message: string;
  data: DetectionResponseData;
}

/**
 * 上传图片进行图像识别（YOLO 目标检测）。
 * 需已登录，请求会携带 Authorization。
 */
export function detectImage(file: File): Promise<DetectImageResponse> {
  const formData = new FormData();
  formData.append('file', file);
  return axiosInstance.post<DetectImageResponse>('/image/detect', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }) as Promise<DetectImageResponse>;
}
