"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

import type { CategoryId, SortKey, TaskFilters } from "@/types";

export const DEFAULT_FILTERS: TaskFilters = {
  query: "",
  status: "all",
  priority: "all",
  difficulty: "all",
  categoryId: "all",
};

interface UIState {
  filters: TaskFilters;
  sort: SortKey;
  /** Categories the user has folded away — persisted so the layout survives reloads. */
  collapsedCategories: CategoryId[];
  sidebarOpen: boolean;

  setFilter: <K extends keyof TaskFilters>(key: K, value: TaskFilters[K]) => void;
  resetFilters: () => void;
  setSort: (sort: SortKey) => void;
  toggleCategory: (id: CategoryId) => void;
  setAllCollapsed: (ids: CategoryId[]) => void;
  setSidebarOpen: (open: boolean) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      filters: DEFAULT_FILTERS,
      sort: "manual",
      collapsedCategories: [],
      sidebarOpen: false,

      setFilter: (key, value) =>
        set((state) => ({ filters: { ...state.filters, [key]: value } })),

      resetFilters: () => set({ filters: DEFAULT_FILTERS }),

      setSort: (sort) => set({ sort }),

      toggleCategory: (id) =>
        set((state) => ({
          collapsedCategories: state.collapsedCategories.includes(id)
            ? state.collapsedCategories.filter((c) => c !== id)
            : [...state.collapsedCategories, id],
        })),

      setAllCollapsed: (ids) => set({ collapsedCategories: ids }),

      setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
    }),
    {
      name: "developer-goals::ui:v1",
      storage: createJSONStorage(() => localStorage),
      // The search query and the mobile drawer are per-session concerns — reviving
      // them on reload would show a filtered roadmap with no obvious cause.
      partialize: (state) => ({
        filters: { ...state.filters, query: "" },
        sort: state.sort,
        collapsedCategories: state.collapsedCategories,
      }),
    },
  ),
);
