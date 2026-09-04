import { create } from "zustand";

const useTaskCollectionsStore = create(() => ({
  collections: [],  
}));

export default useTaskCollectionsStore;
