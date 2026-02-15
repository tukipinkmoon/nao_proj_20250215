import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import type {
  CharacterState,
  CharacterVariant,
  CharacterEmotion,
} from "@/types";

interface CharacterItem {
  id: string;
  name: string;
  category: "hat" | "accessory" | "background" | "effect";
  cost: number;
  imageUrl: string;
  requiredLevel?: number;
}

interface CharacterStoreState {
  characterState: CharacterState;
  availableItems: CharacterItem[];

  // Actions
  addCoins: (amount: number) => void;
  spendCoins: (amount: number) => boolean;
  equipItem: (itemId: string) => void;
  unequipItem: (itemId: string) => void;
  buyItem: (itemId: string) => boolean;
  setVariant: (variant: CharacterVariant) => void;
  setEmotion: (emotion: CharacterEmotion) => void;
  setLevel: (level: number) => void;
  setAvailableItems: (items: CharacterItem[]) => void;

  // Computed
  getEmotion: (context: {
    score?: number;
    isNewRecord?: boolean;
    isPlaying?: boolean;
    hour?: number;
    badgeEarned?: boolean;
  }) => CharacterEmotion;
  canAfford: (cost: number) => boolean;
  getOwnedItems: () => CharacterItem[];
  getEquippedItems: () => CharacterItem[];
}

const defaultCharacterState: CharacterState = {
  variant: "hakase",
  emotion: "happy",
  level: 1,
  coins: 0,
  equippedItems: [],
  ownedItems: [],
};

export const useCharacterStore = create<CharacterStoreState>()(
  devtools(
    persist(
      (set, get) => ({
        characterState: defaultCharacterState,
        availableItems: [],

        addCoins: (amount) =>
          set((state) => ({
            characterState: {
              ...state.characterState,
              coins: state.characterState.coins + amount,
            },
          })),

        spendCoins: (amount) => {
          const { characterState } = get();
          if (characterState.coins < amount) return false;
          set((state) => ({
            characterState: {
              ...state.characterState,
              coins: state.characterState.coins - amount,
            },
          }));
          return true;
        },

        equipItem: (itemId) =>
          set((state) => {
            const { equippedItems, ownedItems } = state.characterState;
            if (!ownedItems.includes(itemId)) return state;
            if (equippedItems.includes(itemId)) return state;
            return {
              characterState: {
                ...state.characterState,
                equippedItems: [...equippedItems, itemId],
              },
            };
          }),

        unequipItem: (itemId) =>
          set((state) => ({
            characterState: {
              ...state.characterState,
              equippedItems: state.characterState.equippedItems.filter(
                (id) => id !== itemId
              ),
            },
          })),

        buyItem: (itemId) => {
          const { characterState, availableItems } = get();
          const item = availableItems.find((i) => i.id === itemId);
          if (!item) return false;
          if (characterState.coins < item.cost) return false;
          if (characterState.ownedItems.includes(itemId)) return false;
          if (item.requiredLevel && characterState.level < item.requiredLevel) {
            return false;
          }

          set((state) => ({
            characterState: {
              ...state.characterState,
              coins: state.characterState.coins - item.cost,
              ownedItems: [...state.characterState.ownedItems, itemId],
            },
          }));
          return true;
        },

        setVariant: (variant) =>
          set((state) => ({
            characterState: { ...state.characterState, variant },
          })),

        setEmotion: (emotion) =>
          set((state) => ({
            characterState: { ...state.characterState, emotion },
          })),

        setLevel: (level) =>
          set((state) => ({
            characterState: {
              ...state.characterState,
              level: Math.max(1, Math.min(5, level)),
            },
          })),

        setAvailableItems: (items) => set({ availableItems: items }),

        getEmotion: (context) => {
          const { score, isNewRecord, isPlaying, hour, badgeEarned } = context;

          if (badgeEarned) return "celebrating";
          if (isNewRecord) return "excited";
          if (isPlaying) return "encouraging";

          if (hour !== undefined && (hour >= 22 || hour < 5)) {
            return "sleeping";
          }

          if (score !== undefined) {
            if (score >= 90) return "excited";
            if (score >= 70) return "happy";
            if (score < 50) return "encouraging";
          }

          return "happy";
        },

        canAfford: (cost) => {
          const { characterState } = get();
          return characterState.coins >= cost;
        },

        getOwnedItems: () => {
          const { characterState, availableItems } = get();
          return availableItems.filter((item) =>
            characterState.ownedItems.includes(item.id)
          );
        },

        getEquippedItems: () => {
          const { characterState, availableItems } = get();
          return availableItems.filter((item) =>
            characterState.equippedItems.includes(item.id)
          );
        },
      }),
      { name: "brain-character-store" }
    ),
    { name: "character-store" }
  )
);
