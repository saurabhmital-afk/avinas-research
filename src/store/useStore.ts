import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Company } from '../data/types';

export interface ResearchRecord {
  id: string;
  companyName: string;
  researchType: 'overview' | 'user-research';
  focusAreas: string[];
  customInstructions: string;
  prompt: string;
  report: string;
  createdAt: string;
  status: 'draft' | 'complete';
}

export interface Collection {
  id: string;
  name: string;
  color: string;
  createdAt: string;
  companyIds: string[];
}

export interface Tag {
  id: string;
  name: string;
  color: string;
  createdAt: string;
}

export interface Note {
  id: string;
  companyId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface CompanyTags {
  [companyId: string]: string[]; // tag IDs
}

interface AppStore {
  // Settings
  claudeApiKey: string;
  setClaudeApiKey: (key: string) => void;

  // Custom researched companies
  customCompanies: Company[];
  addCustomCompany: (company: Company) => void;
  updateCustomCompany: (id: string, patch: Partial<Company>) => void;
  deleteCustomCompany: (id: string) => void;

  // Research records
  researchRecords: ResearchRecord[];
  saveResearchRecord: (record: ResearchRecord) => void;
  updateResearchRecord: (id: string, patch: Partial<ResearchRecord>) => void;
  deleteResearchRecord: (id: string) => void;
  getResearchForCompany: (companyName: string) => ResearchRecord[];

  // UI prefs
  darkMode: boolean;
  advancedMode: boolean;
  sidebarOpen: boolean;
  toggleDarkMode: () => void;
  toggleAdvancedMode: () => void;
  toggleSidebar: () => void;

  // Favorites
  favorites: string[]; // company IDs in order
  addFavorite: (id: string) => void;
  removeFavorite: (id: string) => void;
  reorderFavorites: (from: number, to: number) => void;
  isFavorite: (id: string) => boolean;

  // Collections
  collections: Collection[];
  createCollection: (name: string, color?: string) => Collection;
  deleteCollection: (id: string) => void;
  renameCollection: (id: string, name: string) => void;
  addToCollection: (collectionId: string, companyId: string) => void;
  removeFromCollection: (collectionId: string, companyId: string) => void;
  getCollectionsForCompany: (companyId: string) => Collection[];
  isInCollection: (collectionId: string, companyId: string) => boolean;

  // Tags
  tags: Tag[];
  companyTags: CompanyTags;
  createTag: (name: string, color?: string) => Tag;
  deleteTag: (id: string) => void;
  renameTag: (id: string, name: string) => void;
  addTagToCompany: (companyId: string, tagId: string) => void;
  removeTagFromCompany: (companyId: string, tagId: string) => void;
  getTagsForCompany: (companyId: string) => Tag[];
  getCompaniesForTag: (tagId: string) => string[];

  // Notes
  notes: Note[];
  saveNote: (companyId: string, content: string) => void;
  deleteNote: (noteId: string) => void;
  getNoteForCompany: (companyId: string) => Note | undefined;

  // Recently viewed
  recentlyViewed: string[]; // company IDs, most recent first
  addRecentlyViewed: (id: string) => void;

  // Compare
  compareList: string[]; // company IDs (max 4)
  addToCompare: (id: string) => void;
  removeFromCompare: (id: string) => void;
  clearCompare: () => void;
  isInCompare: (id: string) => boolean;
}

const TAG_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];
const COLLECTION_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

function uid() {
  return Math.random().toString(36).slice(2, 11);
}

export const useStore = create<AppStore>()(
  persist(
    (set, get) => ({
      // Settings
      claudeApiKey: '',
      setClaudeApiKey: (key) => set({ claudeApiKey: key }),

      // Custom companies
      customCompanies: [],
      addCustomCompany: (company) => set(s => ({
        customCompanies: [...s.customCompanies.filter(c => c.id !== company.id), company],
      })),
      updateCustomCompany: (id, patch) => set(s => ({
        customCompanies: s.customCompanies.map(c => c.id === id ? { ...c, ...patch } : c),
      })),
      deleteCustomCompany: (id) => set(s => ({
        customCompanies: s.customCompanies.filter(c => c.id !== id),
      })),

      // Research records
      researchRecords: [],
      saveResearchRecord: (record) => set(s => ({
        researchRecords: [...s.researchRecords.filter(r => r.id !== record.id), record],
      })),
      updateResearchRecord: (id, patch) => set(s => ({
        researchRecords: s.researchRecords.map(r => r.id === id ? { ...r, ...patch } : r),
      })),
      deleteResearchRecord: (id) => set(s => ({
        researchRecords: s.researchRecords.filter(r => r.id !== id),
      })),
      getResearchForCompany: (companyName) => {
        const name = companyName.toLowerCase();
        return get().researchRecords.filter(r => r.companyName.toLowerCase() === name);
      },

      darkMode: false,
      advancedMode: false,
      sidebarOpen: true,

      toggleDarkMode: () => set(s => {
        const next = !s.darkMode;
        document.documentElement.classList.toggle('dark', next);
        return { darkMode: next };
      }),
      toggleAdvancedMode: () => set(s => ({ advancedMode: !s.advancedMode })),
      toggleSidebar: () => set(s => ({ sidebarOpen: !s.sidebarOpen })),

      // Favorites
      favorites: [],
      addFavorite: (id) => set(s => ({
        favorites: s.favorites.includes(id) ? s.favorites : [...s.favorites, id],
      })),
      removeFavorite: (id) => set(s => ({ favorites: s.favorites.filter(f => f !== id) })),
      reorderFavorites: (from, to) => set(s => {
        const arr = [...s.favorites];
        const [item] = arr.splice(from, 1);
        arr.splice(to, 0, item);
        return { favorites: arr };
      }),
      isFavorite: (id) => get().favorites.includes(id),

      // Collections
      collections: [{ id: 'default', name: 'Saved', color: '#3b82f6', createdAt: new Date().toISOString(), companyIds: [] }],
      createCollection: (name, color) => {
        const col: Collection = {
          id: uid(),
          name,
          color: color ?? COLLECTION_COLORS[get().collections.length % COLLECTION_COLORS.length],
          createdAt: new Date().toISOString(),
          companyIds: [],
        };
        set(s => ({ collections: [...s.collections, col] }));
        return col;
      },
      deleteCollection: (id) => set(s => ({ collections: s.collections.filter(c => c.id !== id) })),
      renameCollection: (id, name) => set(s => ({
        collections: s.collections.map(c => c.id === id ? { ...c, name } : c),
      })),
      addToCollection: (collectionId, companyId) => set(s => ({
        collections: s.collections.map(c =>
          c.id === collectionId && !c.companyIds.includes(companyId)
            ? { ...c, companyIds: [...c.companyIds, companyId] }
            : c
        ),
      })),
      removeFromCollection: (collectionId, companyId) => set(s => ({
        collections: s.collections.map(c =>
          c.id === collectionId
            ? { ...c, companyIds: c.companyIds.filter(id => id !== companyId) }
            : c
        ),
      })),
      getCollectionsForCompany: (companyId) => get().collections.filter(c => c.companyIds.includes(companyId)),
      isInCollection: (collectionId, companyId) => {
        const col = get().collections.find(c => c.id === collectionId);
        return col ? col.companyIds.includes(companyId) : false;
      },

      // Tags
      tags: [],
      companyTags: {},
      createTag: (name, color) => {
        const existing = get().tags.find(t => t.name.toLowerCase() === name.toLowerCase());
        if (existing) return existing;
        const tag: Tag = {
          id: uid(),
          name,
          color: color ?? TAG_COLORS[get().tags.length % TAG_COLORS.length],
          createdAt: new Date().toISOString(),
        };
        set(s => ({ tags: [...s.tags, tag] }));
        return tag;
      },
      deleteTag: (id) => set(s => {
        const companyTags = { ...s.companyTags };
        Object.keys(companyTags).forEach(cid => {
          companyTags[cid] = companyTags[cid].filter(tid => tid !== id);
        });
        return { tags: s.tags.filter(t => t.id !== id), companyTags };
      }),
      renameTag: (id, name) => set(s => ({
        tags: s.tags.map(t => t.id === id ? { ...t, name } : t),
      })),
      addTagToCompany: (companyId, tagId) => set(s => ({
        companyTags: {
          ...s.companyTags,
          [companyId]: [...(s.companyTags[companyId] ?? []).filter(t => t !== tagId), tagId],
        },
      })),
      removeTagFromCompany: (companyId, tagId) => set(s => ({
        companyTags: {
          ...s.companyTags,
          [companyId]: (s.companyTags[companyId] ?? []).filter(t => t !== tagId),
        },
      })),
      getTagsForCompany: (companyId) => {
        const ids = get().companyTags[companyId] ?? [];
        return get().tags.filter(t => ids.includes(t.id));
      },
      getCompaniesForTag: (tagId) => {
        const ct = get().companyTags;
        return Object.keys(ct).filter(cid => ct[cid].includes(tagId));
      },

      // Notes
      notes: [],
      saveNote: (companyId, content) => set(s => {
        const existing = s.notes.find(n => n.companyId === companyId);
        const now = new Date().toISOString();
        if (existing) {
          return { notes: s.notes.map(n => n.companyId === companyId ? { ...n, content, updatedAt: now } : n) };
        }
        return { notes: [...s.notes, { id: uid(), companyId, content, createdAt: now, updatedAt: now }] };
      }),
      deleteNote: (noteId) => set(s => ({ notes: s.notes.filter(n => n.id !== noteId) })),
      getNoteForCompany: (companyId) => get().notes.find(n => n.companyId === companyId),

      // Recently viewed
      recentlyViewed: [],
      addRecentlyViewed: (id) => set(s => ({
        recentlyViewed: [id, ...s.recentlyViewed.filter(r => r !== id)].slice(0, 20),
      })),

      // Compare
      compareList: [],
      addToCompare: (id) => set(s => ({
        compareList: s.compareList.includes(id)
          ? s.compareList
          : [...s.compareList, id].slice(0, 4),
      })),
      removeFromCompare: (id) => set(s => ({ compareList: s.compareList.filter(c => c !== id) })),
      clearCompare: () => set({ compareList: [] }),
      isInCompare: (id) => get().compareList.includes(id),
    }),
    { name: 'avinas-research-store' }
  )
);

// Apply dark mode on load
const stored = JSON.parse(localStorage.getItem('avinas-research-store') ?? '{}');
if (stored?.state?.darkMode) {
  document.documentElement.classList.add('dark');
}
