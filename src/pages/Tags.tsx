import { useState } from 'react';
import { Tag as TagIcon, Plus, Trash2, Edit2, Check, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { getCompanyById } from '../data/companies';
import CompanyCard from '../components/company/CompanyCard';

export default function Tags() {
  const { tags, createTag, deleteTag, renameTag, getCompaniesForTag } = useStore();
  const [newName, setNewName] = useState('');
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [activeId, setActiveId] = useState<string | null>(tags[0]?.id ?? null);

  const active = tags.find(t => t.id === activeId);
  const companyIds = active ? getCompaniesForTag(active.id) : [];
  const companies = companyIds.map(id => getCompanyById(id)).filter(Boolean);

  function handleCreate() {
    if (!newName.trim()) return;
    const tag = createTag(newName.trim());
    setActiveId(tag.id);
    setNewName('');
    setCreating(false);
  }

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold text-slate-900 dark:text-white mb-5">Tags</h1>

      <div className="flex gap-4">
        {/* Tag list */}
        <div className="w-52 flex-shrink-0">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
            {tags.length === 0 && !creating && (
              <div className="px-4 py-6 text-center text-xs text-slate-400">
                No tags yet. Create your first tag to get started.
              </div>
            )}
            {tags.map(tag => (
              <div key={tag.id} className="group flex items-center gap-2 px-3 py-2.5 cursor-pointer border-b last:border-b-0 border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                {editingId === tag.id ? (
                  <div className="flex items-center gap-1 flex-1">
                    <input autoFocus value={editName} onChange={e => setEditName(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') { renameTag(tag.id, editName.trim()); setEditingId(null); } if (e.key === 'Escape') setEditingId(null); }}
                      className="flex-1 text-xs border border-brand-300 rounded px-1.5 py-0.5 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none" />
                    <button onClick={() => { renameTag(tag.id, editName.trim()); setEditingId(null); }} className="text-emerald-500"><Check size={12} /></button>
                    <button onClick={() => setEditingId(null)} className="text-slate-400"><X size={12} /></button>
                  </div>
                ) : (
                  <>
                    <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: tag.color }} />
                    <button onClick={() => setActiveId(tag.id)} className="flex-1 text-left text-sm text-slate-700 dark:text-slate-200 truncate">
                      {tag.name}
                    </button>
                    <span className="text-xs text-slate-400 flex-shrink-0">{getCompaniesForTag(tag.id).length}</span>
                    <div className="hidden group-hover:flex items-center gap-1">
                      <button onClick={() => { setEditingId(tag.id); setEditName(tag.name); }} className="text-slate-400 hover:text-brand-600"><Edit2 size={11} /></button>
                      <button onClick={() => { deleteTag(tag.id); if (activeId === tag.id) setActiveId(tags[1]?.id ?? null); }} className="text-slate-400 hover:text-red-500"><Trash2 size={11} /></button>
                    </div>
                  </>
                )}
              </div>
            ))}

            {creating ? (
              <div className="flex items-center gap-1 px-3 py-2.5 border-t border-slate-100 dark:border-slate-800">
                <input autoFocus value={newName} onChange={e => setNewName(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') handleCreate(); if (e.key === 'Escape') setCreating(false); }}
                  placeholder="Tag name…"
                  className="flex-1 text-xs border border-brand-300 rounded px-1.5 py-0.5 bg-white dark:bg-slate-800 focus:outline-none" />
                <button onClick={handleCreate} className="text-emerald-500"><Check size={12} /></button>
                <button onClick={() => setCreating(false)} className="text-slate-400"><X size={12} /></button>
              </div>
            ) : (
              <button onClick={() => setCreating(true)} className="w-full flex items-center gap-1.5 px-3 py-2.5 text-xs text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-900/20 border-t border-slate-100 dark:border-slate-800 transition-colors">
                <Plus size={13} /> New tag
              </button>
            )}
          </div>
        </div>

        {/* Companies with active tag */}
        <div className="flex-1">
          {active ? (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-white text-sm font-medium" style={{ backgroundColor: active.color }}>
                  <TagIcon size={12} /> {active.name}
                </span>
                <span className="text-sm text-slate-400">({companies.length} companies)</span>
              </div>

              {companies.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 text-slate-400 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl">
                  <TagIcon size={32} className="mb-2 opacity-40" />
                  <p className="text-sm font-medium">No companies with this tag</p>
                  <p className="text-xs mt-1">Apply this tag from any company profile page.</p>
                  <Link to="/" className="mt-3 text-brand-600 text-xs hover:underline">Browse companies →</Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {companies.map(c => c && <CompanyCard key={c.id} company={c} />)}
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center h-48 text-slate-400">
              <div className="text-center">
                <TagIcon size={32} className="mx-auto mb-2 opacity-40" />
                <p className="text-sm">Select a tag to see its companies</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
