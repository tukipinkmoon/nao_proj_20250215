import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import type { User, UserSettings, UIMode, AgeGroup } from "@/types";

interface UserState {
  user: User | null;
  settings: UserSettings;
  isOnboarded: boolean;

  // Actions
  setUser: (user: User) => void;
  updateSettings: (settings: Partial<UserSettings>) => void;
  setUIMode: (mode: UIMode) => void;
  setOnboarded: () => void;
  logout: () => void;
}

const defaultSettings: UserSettings = {
  uiMode: "standard",
  fontSize: "normal",
  soundEnabled: true,
  vibrationEnabled: true,
  notificationEnabled: true,
  dailyReminderTime: "09:00",
  theme: "system",
  language: "ja",
  reducedMotion: false,
};

export const useUserStore = create<UserState>()(
  devtools(
    persist(
      (set) => ({
        user: null,
        settings: defaultSettings,
        isOnboarded: false,

        setUser: (user) => set({ user }),
        updateSettings: (partial) =>
          set((state) => ({ settings: { ...state.settings, ...partial } })),
        setUIMode: (mode) =>
          set((state) => ({ settings: { ...state.settings, uiMode: mode } })),
        setOnboarded: () => set({ isOnboarded: true }),
        logout: () => set({ user: null, isOnboarded: false }),
      }),
      { name: "brain-user-store" }
    ),
    { name: "user-store" }
  )
);
