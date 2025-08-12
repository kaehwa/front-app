import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Florist } from "../types/florist";

type State = {
  likedIds: string[];
  toggleLike: (id: string) => void;
  isLiked: (id: string) => boolean;
  // 선택된 플로리스트 리스트 계산용
  likedFlorists: (all: Florist[]) => Florist[];
};

export const useLikesStore = create<State>()(
  persist(
    (set, get) => ({
      likedIds: [],
      toggleLike: (id) =>
        set((s) => {
          const has = s.likedIds.includes(id);
          return { likedIds: has ? s.likedIds.filter(x => x !== id) : [...s.likedIds, id] };
        }),
      isLiked: (id) => get().likedIds.includes(id),
      likedFlorists: (all) => all.filter(f => get().likedIds.includes(f.id)),
    }),
    {
      name: "gaehwa.likes.v1",
      storage: createJSONStorage(() => AsyncStorage),
      version: 1,
    }
  )
);
