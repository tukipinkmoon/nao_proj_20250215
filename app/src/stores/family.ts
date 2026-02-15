import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import type { Family, FamilyMember, Message } from "@/types";

interface FamilyState {
  family: Family | null;
  members: FamilyMember[];
  messages: Message[];
  unreadCount: number;

  // Actions
  setFamily: (family: Family) => void;
  clearFamily: () => void;
  setMembers: (members: FamilyMember[]) => void;
  updateMember: (userId: string, updates: Partial<FamilyMember>) => void;
  addMessage: (message: Message) => void;
  setMessages: (messages: Message[]) => void;
  markRead: (messageId: string, userId: string) => void;
  markAllRead: (userId: string) => void;

  // Computed
  getUnreadCount: (userId: string) => number;
  getMember: (userId: string) => FamilyMember | null;
  getRecentMessages: (limit: number) => Message[];
}

export const useFamilyStore = create<FamilyState>()(
  devtools(
    persist(
      (set, get) => ({
        family: null,
        members: [],
        messages: [],
        unreadCount: 0,

        setFamily: (family) =>
          set({ family, members: family.members }),

        clearFamily: () =>
          set({ family: null, members: [], messages: [], unreadCount: 0 }),

        setMembers: (members) => set({ members }),

        updateMember: (userId, updates) =>
          set((state) => ({
            members: state.members.map((m) =>
              m.userId === userId ? { ...m, ...updates } : m
            ),
          })),

        addMessage: (message) =>
          set((state) => ({
            messages: [...state.messages, message],
            unreadCount: state.unreadCount + 1,
          })),

        setMessages: (messages) => set({ messages }),

        markRead: (messageId, userId) =>
          set((state) => {
            let decremented = false;
            const messages = state.messages.map((m) => {
              if (m.id === messageId && !m.readBy.includes(userId)) {
                decremented = true;
                return { ...m, readBy: [...m.readBy, userId] };
              }
              return m;
            });
            return {
              messages,
              unreadCount: decremented
                ? Math.max(0, state.unreadCount - 1)
                : state.unreadCount,
            };
          }),

        markAllRead: (userId) =>
          set((state) => ({
            messages: state.messages.map((m) =>
              m.readBy.includes(userId)
                ? m
                : { ...m, readBy: [...m.readBy, userId] }
            ),
            unreadCount: 0,
          })),

        getUnreadCount: (userId) => {
          const { messages } = get();
          return messages.filter((m) => !m.readBy.includes(userId)).length;
        },

        getMember: (userId) => {
          const { members } = get();
          return members.find((m) => m.userId === userId) ?? null;
        },

        getRecentMessages: (limit) => {
          const { messages } = get();
          return messages
            .slice()
            .sort(
              (a, b) =>
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime()
            )
            .slice(0, limit);
        },
      }),
      { name: "brain-family-store" }
    ),
    { name: "family-store" }
  )
);
