import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { zustandAppStorage } from "@/shared/lib/storageAdapter";
import type { IUser } from "../model/types";

interface UserState {
  user: IUser;
  accessToken: string;
}

interface ActionsState {
  setAccessToken: (token: string) => void;
  reset: () => void;
}

export const useUserStore = create<UserState & ActionsState>()(
  persist(
    (set) => ({
      user: {
        userName: "",
      },
      accessToken: "",

      setAccessToken: (token) => set({ accessToken: token }),

      reset: () =>
        set({
          user: { userName: "" },
          accessToken: "",
        }),
    }),
    {
      name: "user-store",
      storage: createJSONStorage(() => zustandAppStorage),
    },
  ),
);
