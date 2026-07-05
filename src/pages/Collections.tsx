import { useState } from 'react';
import { FolderOpen, Plus, Trash2, Edit2, Check, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { getCompanyById } from '../data/companies';
import CompanyCard from '../components/company/CompanyCard';
import clsx from 'clsx';

export default function Collections() {
  const { collections, createCollection, deleteCollection, renameCollection } = useStore();
  const [newName, setNewName] = useState('');
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [activeId, setActiveId] = useState(collections[0]?.id ?? '');

  const active = collections.find(c => c.id === activeId);
  const companies = (active?.companyIds ?? []).map(id => getCompanyById(id)).filter(Boolean);

  function handleCreate() {
    if (!newName.trim()) return;
    const col = createCollection(newName.trim());
    setActiveId(col.id);
    setNewName('');
    setCreating(false);
  }

  function startEdit(col: typeof collections[0]) {
    setEditingId(col.id);
    setEditName(col.name);
  }

  function confirmEdit() {
    if (editingId && editName.trim()) renameCollection(editingId, editName.trim());
    setEditingId(null);
  }

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold text-slate-900 dark:text-white mb-5">Collections</h1>

      <div className="flex gap-4">
        {/* Collection list */}
        <div className="w-52 flex-shrink-0">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
            {collections.map(col => (
              <div key={col.id} className={clsx('group flex items-center gap-2 px-3 py-2.5 cursor-pointer border-b last:border-b-0 border-slate-100 dark:border-slate-800 transition-colors',
                activeId === col.id ? 'bg-brand-50 dark:bg-brand-900/20' : 'hover:bg-slate-50 dark:hover:bg-slate-800')}>
                {editingId === col.id ? (
                  <div className="flex items-center gap-1 flex-1">
                    <input autoFocus value={editName} onChange={e => setEditName(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') confirmEdit(); if (e.key === 'Escape') setEditingId(null); }}
                      className="flex-1 text-xs border border-brand-300 rounded px-1.5 py-0.5 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none" />
                    <button onClick={confirmEdit} className="text-emerald-500 hover:text-emerald-600"><Check size={12} /></button>
                    <button onClick={() => setEditingId(null)} className="text-slate-400 hover:text-slate-600"><X size={12} /></button>
                  </div>
                ) : (
                  <>
                    <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: col.color }} />
                    <button onClick={() => setActiveId(col.id)} className={clsx('flex-1 text-left text-sm font-medium truncate', activeId === col.id ? 'text-brand-700 dark:text-brand-400' : 'text-slate-700 dark:text-slate-200')}>
                      {col.name}
                    </button>
                    <span className="text-xs text-slate-400 flex-shrink-0">{col.companyIds.length}</span>
                    <div className="hidden group-hover:flex items-center gap-1 flex-shrink-0">
                      <button onClick={() => startEdit(col)} className="text-slate-400 hover:text-brand-600"><Edit2 size={11} /></button>
                      {col.id !== 'default' && (
                        <button onClick={() => { deleteCollection(col.id); if (activeId === col.id) setActiveId(collections[0]?.id ?? ''); }}
                          className="text-slate-400 hover:text-red-500"><Trash2 size={11} /></button>
                      )}
                    </div>
                  </>
                )}
              </div>
            ))}

            {creating ? (
              <div className="flex items-center gap-1 px-3 py-2.5 border-t border-slate-100 dark:border-slate-800">
                <input autoFocus value={newName} onChange={e => setNewName(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') handleCreate(); if (e.key === 'Escape') setCreating(false); }}
                  placeholder="Collection name…"
                  className="flex-1 text-xs border border-brand-300 rounded px-1.5 py-0.5 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none" />
                <button onClick={handleCreate} className="text-emerald-500 hover:text-emerald-600"><Check size={12} /></button>
                <button onClick={() => setCreating(false)} className="text-slate-400 hover:text-slate-600"><X size={12} /></button>
              </div>
            ) : (
              <button onClick={() => setCreating(true)} className="w-full flex items-center gap-1.5 px-3 py-2.5 text-xs text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-900/20 border-t border-slate-100 dark:border-slate-800 transition-colors">
                <Plus size={13} /> New collection
              </button>
            )}
          </div>
        </div>

        {/* Companies in active collection */}
        <div className="flex-1">
          {active && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: active.color }} />
                <h2 className="text-base font-semibold text-slate-800 dark:text-slate-100">{active.name}</h2>
                <span className="text-sm text-slate-400">({companies.length})</span>
              </div>

              {companies.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 text-slate-400 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl">
                  <FolderOpen size={32} className="mb-2 opacity-40" />
                  <p className="text-sm font-medium">Collection is empty</p>
                  <p className="text-xs mt-1">Save companies from the directory or profile pages.</p>
                  <Link to="/" className="mt-3 text-brand-600 text-xs hover:underline">Browse companies →</Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {companies.map(c => c && <CompanyCard key={c.id} company={c} />)}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
