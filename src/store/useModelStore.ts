import { create } from 'zustand';

interface ModelStore {
  /** 当前选中的模型内部名称（后端使用的 model_name） */
  currentModel: string;
  setCurrentModel: (model: string) => void;
}

export const DEFAULT_MODEL_NAME = 'qwen3.5-plus';

export const useModelStore = create<ModelStore>((set) => ({
  currentModel: DEFAULT_MODEL_NAME,
  setCurrentModel: (model: string) => set({ currentModel: model }),
}));

