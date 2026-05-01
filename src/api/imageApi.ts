import axiosInstance from './axiosInstance';

/** 单条检测结果（与后端 DetectionItem 一致） */
export interface DetectionItem {
  class_name: string;
  class_id: number;
  confidence: number;
  bbox: number[];
  /** 中文物种名称（LLM 增强） */
  species_name_zh?: string | null;
  /** 简短描述（LLM 增强） */
  description?: string | null;
}

/** 检测接口响应 data 结构 */
export interface DetectionResponseData {
  detections: DetectionItem[];
  count: number;
  annotated_image_url?: string | null;
  original_image_url?: string | null;
}

/** 调用 detect 后 axios 拦截器返回的完整响应体 */
export interface DetectImageResponse {
  result: string;
  code: number;
  message: string;
  data: DetectionResponseData;
}

export interface DetectionHistoryItem {
  id: number;
  user_id: number;
  original_image_url?: string | null;
  annotated_image_url?: string | null;
  detections: DetectionItem[];
  top_species_name?: string | null;
  top_confidence?: number | null;
  create_time: string;
}

export interface DetectionHistoryListData {
  records: DetectionHistoryItem[];
  total: number;
  page: number;
  page_size: number;
}

export interface DetectionHistoryListResponse {
  result: string;
  code: number;
  message: string;
  data: DetectionHistoryListData;
}

export interface DetectionHistoryDetailResponse {
  result: string;
  code: number;
  message: string;
  data: DetectionHistoryItem;
}

export interface CurrentModelInfo {
  weights_name: string;
  weights_path: string;
  updated_at?: string | null;
}

export interface CurrentModelResponse {
  result: string;
  code: number;
  message: string;
  data: CurrentModelInfo;
}

/**
 * 上传图片进行图像识别（YOLO 目标检测）。
 * 需已登录，请求会携带 Authorization。
 */
export function detectImage(file: File): Promise<DetectImageResponse> {
  const formData = new FormData();
  formData.append('file', file);
  return axiosInstance.post('/image/detect', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
}

export function getDetectionHistory(
  params: { page?: number; page_size?: number } = {}
): Promise<DetectionHistoryListResponse> {
  return axiosInstance.get('/image/history', {
    params,
  });
}

export function getDetectionHistoryDetail(
  id: number
): Promise<DetectionHistoryDetailResponse> {
  return axiosInstance.get(`/image/history/${id}`);
}

export function deleteDetectionHistory(id: number): Promise<{ result: string; code: number; message: string; data: { id: number } }> {
  return axiosInstance.delete(`/image/history/${id}`);
}

export function uploadDetectionModel(file: File): Promise<CurrentModelResponse> {
  const formData = new FormData();
  formData.append('file', file);
  return axiosInstance.post('/image/model/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
}

export function getCurrentDetectionModel(): Promise<CurrentModelResponse> {
  return axiosInstance.get('/image/model/current');
}
