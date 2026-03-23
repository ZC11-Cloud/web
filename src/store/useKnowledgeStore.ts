import { create } from 'zustand';
import knowledgeApi from '../api/knowledgeApi';
import type {
  KnowledgeDocumentItem,
  KnowledgeDocumentsParams,
  KnowledgeSearchHit,
} from '../api/knowledgeApi';

interface KnowledgeStore {
  documents: KnowledgeDocumentItem[];
  total: number;
  page: number;
  pageSize: number;
  loading: boolean;
  error: string | null;
  /** 当前查看的文档详情（用于弹窗/详情页） */
  currentDocument: KnowledgeDocumentItem | null;
  detailLoading: boolean;
  detailError: string | null;
  /** 文档完整正文（用于文档阅读） */
  documentContent: string | null;
  contentLoading: boolean;
  contentError: string | null;
  searchQuery: string;
  searchResults: KnowledgeSearchHit[];
  searchLoading: boolean;
  searchError: string | null;
  uploadLoading: boolean;

  fetchDocuments: (params?: Partial<KnowledgeDocumentsParams>) => Promise<void>;
  fetchDocument: (sourceId: string) => Promise<void>;
  fetchDocumentContent: (sourceId: string) => Promise<void>;
  searchDocuments: (q: string, topK?: number) => Promise<void>;
  clearSearch: () => void;
  uploadDocument: (file: File) => Promise<void>;
  deleteDocument: (sourceId: string) => Promise<void>;

  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
  clearCurrentDocument: () => void;
  clearError: () => void;
}

export const useKnowledgeStore = create<KnowledgeStore>((set, get) => ({
  documents: [],
  total: 0,
  page: 1,
  pageSize: 20,
  loading: false,
  error: null,
  currentDocument: null,
  detailLoading: false,
  detailError: null,
  documentContent: null,
  contentLoading: false,
  contentError: null,
  searchQuery: '',
  searchResults: [],
  searchLoading: false,
  searchError: null,
  uploadLoading: false,

  fetchDocuments: async (params = {}) => {
    const { page = get().page, page_size = get().pageSize } = params;
    set({ loading: true, error: null });

    try {
      const response = await knowledgeApi.getDocuments({ page, page_size });
      set({
        documents: response.documents,
        total: response.total,
        page: response.page,
        pageSize: response.page_size,
        loading: false,
      });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : '获取文档列表失败',
        loading: false,
      });
    }
  },

  fetchDocument: async (sourceId: string) => {
    set({ detailLoading: true, detailError: null, currentDocument: null });

    try {
      const doc = await knowledgeApi.getDocument(sourceId);
      set({ currentDocument: doc, detailLoading: false });
    } catch (err) {
      set({
        detailError: err instanceof Error ? err.message : '获取文档详情失败',
        detailLoading: false,
      });
    }
  },

  fetchDocumentContent: async (sourceId: string) => {
    set({ contentLoading: true, contentError: null, documentContent: null });

    try {
      const res = await knowledgeApi.getDocumentContent(sourceId);
      set({ documentContent: res.content, contentLoading: false });
    } catch (err) {
      set({
        contentError: err instanceof Error ? err.message : '获取文档正文失败',
        contentLoading: false,
      });
    }
  },

  searchDocuments: async (q: string, topK = 10) => {
    const query = q.trim();
    if (!query) {
      set({
        searchQuery: '',
        searchResults: [],
        searchLoading: false,
        searchError: null,
      });
      return;
    }
    set({
      searchQuery: query,
      searchLoading: true,
      searchError: null,
    });
    try {
      const res = await knowledgeApi.searchDocuments(query, topK);
      set({
        searchResults: res.hits,
        searchLoading: false,
      });
    } catch (err) {
      set({
        searchError: err instanceof Error ? err.message : '搜索失败',
        searchLoading: false,
      });
    }
  },

  clearSearch: () =>
    set({
      searchQuery: '',
      searchResults: [],
      searchLoading: false,
      searchError: null,
    }),

  uploadDocument: async (file: File) => {
    set({ uploadLoading: true, error: null });

    try {
      await knowledgeApi.uploadDocument(file);
      await get().fetchDocuments({ page: get().page, page_size: get().pageSize });
      set({ uploadLoading: false });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : '上传文档失败',
        uploadLoading: false,
      });
      throw err;
    }
  },

  deleteDocument: async (sourceId: string) => {
    try {
      await knowledgeApi.deleteDocument(sourceId);
      set((state) => ({
        documents: state.documents.filter((d) => d.source_id !== sourceId),
        total: Math.max(0, state.total - 1),
        currentDocument:
          state.currentDocument?.source_id === sourceId
            ? null
            : state.currentDocument,
      }));
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : '删除文档失败',
      });
      throw err;
    }
  },

  setPage: (page) => set({ page }),
  setPageSize: (pageSize) => set({ pageSize }),
  clearCurrentDocument: () =>
    set({
      currentDocument: null,
      detailError: null,
      documentContent: null,
      contentError: null,
    }),
  clearError: () => set({ error: null, detailError: null }),
}));
