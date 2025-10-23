import { create } from "zustand";

const useLayoutStore = create((set, get) => ({
  isListView: false,

  setIsListView: (isListView) => {
    set({
      isListView,
    });
  },

  toggleListView: () => set((state) => ({ isListView: !state.isListView })),
}));

export default useLayoutStore;
