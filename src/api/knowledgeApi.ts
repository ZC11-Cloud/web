import axiosInstance from './axiosInstance';

/** 文档列表项 / 详情（与后端 KnowledgeDocumentItem 一致） */
export interface KnowledgeDocumentItem {
  source_id: string;
  original_filename: string;
  summary: string | null;
  tags: string[];
  create_time: string;
  chunk_count: number;
}

/** 文档列表查询参数 */
export interface KnowledgeDocumentsParams {
  page?: number;
  page_size?: number;
}

/** 文档列表响应 */
export interface KnowledgeDocumentListResponse {
  documents: KnowledgeDocumentItem[];
  total: number;
  page: number;
  page_size: number;
}

/** 上传文档响应 */
export interface KnowledgeUploadResponse {
  source_id: string;
  filename: string;
  chunks_added: number;
  message?: string;
}

/** 删除文档响应 */
export interface KnowledgeDeleteResponse {
  source_id: string;
  chunks_deleted: number;
}

/** 文档完整正文响应（用于文档阅读） */
export interface KnowledgeDocumentContentResponse {
  source_id: string;
  original_filename: string;
  content: string;
  file_ext: string;
}

/** 搜索命中项 */
export interface KnowledgeSearchHit {
  source_id: string;
  original_filename: string;
  content: string;
  score: number | null;
}

/** 搜索响应 */
export interface KnowledgeSearchResponse {
  query: string;
  total: number;
  hits: KnowledgeSearchHit[];
}

const knowledgeApi = {
  /** 上传文档 */
  uploadDocument: (file: File): Promise<KnowledgeUploadResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    return axiosInstance.post('/knowledge/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  /** 获取文档列表（分页） */
  getDocuments: (
    params: KnowledgeDocumentsParams = {}
  ): Promise<KnowledgeDocumentListResponse> => {
    return axiosInstance.get('/knowledge/documents', {
      params: {
        page: params.page ?? 1,
        page_size: params.page_size ?? 20,
      },
    });
  },

  /** 获取单个文档详情 */
  getDocument: (sourceId: string): Promise<KnowledgeDocumentItem> => {
    return axiosInstance.get(`/knowledge/documents/${encodeURIComponent(sourceId)}`);
  },

  /** 获取文档完整正文（用于文档阅读） */
  getDocumentContent: (
    sourceId: string
  ): Promise<KnowledgeDocumentContentResponse> => {
    return axiosInstance.get(
      `/knowledge/documents/${encodeURIComponent(sourceId)}/content`
    );
  },

  /** 搜索知识库 */
  searchDocuments: (
    q: string,
    top_k = 10
  ): Promise<KnowledgeSearchResponse> => {
    return axiosInstance.get('/knowledge/search', {
      params: { q, top_k },
    });
  },

  /** 下载文档原文件（可用于 PDF 预览） */
  downloadDocument: (sourceId: string): Promise<Blob> => {
    return axiosInstance.get(
      `/knowledge/documents/${encodeURIComponent(sourceId)}/download`,
      {
        responseType: 'blob',
      }
    );
  },

  /** 删除文档 */
  deleteDocument: (sourceId: string): Promise<KnowledgeDeleteResponse> => {
    return axiosInstance.delete(`/knowledge/documents/${encodeURIComponent(sourceId)}`);
  },
};

export default knowledgeApi;
