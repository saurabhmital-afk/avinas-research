import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star, BookmarkPlus, BookmarkCheck, GitCompare, ExternalLink, TrendingUp, TrendingDown, ChevronDown, ChevronUp, Plus, Tag as TagIcon, FileText, X } from 'lucide-react';
import { getCompanyById, getRelatedCompanies } from '../data/companies';
import { useStore } from '../store/useStore';
import type { Tag, Note } from '../store/useStore';
import CompanyCard from '../components/company/CompanyCard';
import clsx from 'clsx';

function fmt(n?: number, prefix = '$', suffix = 'M') {
  if (!n && n !== 0) return '—';
  if (n >= 1000000) return `${prefix}${(n / 1000000).toFixed(1)}T`;
  if (n >= 1000) return `${prefix}${(n / 1000).toFixed(1)}B`;
  return `${prefix}${n.toFixed(0)}${suffix}`;
}

function pct(n?: number) {
  if (n === undefined || n === null) return '—';
  return `${n > 0 ? '+' : ''}${n.toFixed(1)}%`;
}

export default function CompanyProfile() {
  const { id } = useParams<{ id: string }>();
  const company = id ? getCompanyById(id) : undefined;
  const related = company ? getRelatedCompanies(company) : [];
  const {
    advancedMode, isFavorite, addFavorite, removeFavorite,
    isInCompare, addToCompare, removeFromCompare, compareList,
    addToCollection, removeFromCollection, isInCollection,
    getTagsForCompany, addTagToCompany, removeTagFromCompany, tags, createTag,
    getNoteForCompany, saveNote, deleteNote,
    addRecentlyViewed, collections,
  } = useStore();

  useEffect(() => { if (id) addRecentlyViewed(id); }, [id]);

  if (!company) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-400">
        <div className="text-center">
          <p className="font-medium">Company not found</p>
          <Link to="/" className="text-brand-600 text-sm hover:underline mt-1 block">← Back to directory</Link>
        </div>
      </div>
    );
  }

  const c = company;
  const fav = isFavorite(c.id);
  const inCompare = isInCompare(c.id);
  const saved = isInCollection('default', c.id);
  const companyTags = getTagsForCompany(c.id);
  const note = getNoteForCompany(c.id);

  return (
    <div className="max-w-5xl mx-auto p-6 pb-24">
      {/* Back */}
      <Link to="/" className="text-xs text-slate-400 hover:text-brand-600 mb-4 block">← Back to directory</Link>

      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 mb-4">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <div className={clsx('w-14 h-14 rounded-xl flex items-center justify-center text-white text-lg font-bold flex-shrink-0', c.logoColor)}>
              {c.logoInitials}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{c.name}</h1>
                {c.ticker && (
                  <span className="text-sm font-mono text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                    {c.exchange}: {c.ticker}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <span className={clsx('text-xs px-2 py-0.5 rounded-full font-medium',
                  c.type === 'public' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400')}>
                  {c.type === 'public' ? 'Public' : 'Private'}
                </span>
                <span className="text-sm text-slate-500">{c.industry}</span>
                <span className="text-slate-300 dark:text-slate-600">·</span>
                <span className="text-sm text-slate-500">{c.sector}</span>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => fav ? removeFavorite(c.id) : addFavorite(c.id)}
              className={clsx('flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                fav ? 'bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400' : 'border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-amber-300 hover:text-amber-600')}
            >
              <Star size={14} fill={fav ? 'currentColor' : 'none'} />
              {fav ? 'Favorited' : 'Favorite'}
            </button>
            <button
              onClick={() => saved ? removeFromCollection('default', c.id) : addToCollection('default', c.id)}
              className={clsx('flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                saved ? 'bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-400' : 'border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-brand-300 hover:text-brand-600')}
            >
              {saved ? <BookmarkCheck size={14} /> : <BookmarkPlus size={14} />}
              {saved ? 'Saved' : 'Save'}
            </button>
            <button
              onClick={() => inCompare ? removeFromCompare(c.id) : compareList.length < 4 && addToCompare(c.id)}
              disabled={!inCompare && compareList.length >= 4}
              className={clsx('flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                inCompare ? 'bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' : 'border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-purple-300 hover:text-purple-600',
                !inCompare && compareList.length >= 4 && 'opacity-40 cursor-not-allowed')}
            >
              <GitCompare size={14} />
              {inCompare ? 'In Compare' : 'Compare'}
            </button>
            {c.website && (
              <a href={`https://${c.website}`} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-slate-300 transition-colors">
                <ExternalLink size={14} />
                Website
              </a>
            )}
          </div>
        </div>

        {/* Key stats */}
        <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Stat label="Founded" value={String(c.founded)} />
          <Stat label="Employees" value={c.employees >= 1000 ? `${(c.employees / 1000).toFixed(0)}K` : String(c.employees)} />
          <Stat label="HQ" value={c.headquarters} />
          <Stat label="CEO" value={c.ceo} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Main content */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          {/* Novice summary */}
          {!advancedMode && (
            <Section title="📖 Company in 2 Minutes" novice>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{c.noviceSummary}</p>
            </Section>
          )}

          {/* Overview */}
          <Section title="Overview">
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{c.description}</p>
          </Section>

          {/* Financials */}
          <Section title="Financial Snapshot" badge={c.financials.asOf}>
            {c.type === 'private' && (
              <div className="text-xs bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800 rounded-lg px-3 py-2 mb-3">
                Private company — full audited financials not publicly disclosed. Only confirmed public figures shown.
              </div>
            )}
            {c.financials.fiscalYearEnd && (
              <div className="text-xs text-slate-500 dark:text-slate-400 mb-3 bg-slate-50 dark:bg-slate-800 rounded-lg px-3 py-2">
                ⚠️ Fiscal year ends in <strong>{c.financials.fiscalYearEnd}</strong> (non-calendar year)
              </div>
            )}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {c.financials.revenue && <FinStat label="Revenue" value={fmt(c.financials.revenue)} />}
              {c.financials.aum && <FinStat label="AUM" value={fmt(c.financials.aum)} />}
              {c.financials.revenueGrowth !== undefined && (
                <FinStat label="Revenue Growth" value={pct(c.financials.revenueGrowth)}
                  trend={c.financials.revenueGrowth > 0 ? 'up' : 'down'} />
              )}
              {c.financials.netIncome && <FinStat label="Net Income" value={fmt(c.financials.netIncome)} />}
              {c.financials.grossMargin && <FinStat label="Gross Margin" value={pct(c.financials.grossMargin)} />}
              {c.financials.operatingMargin !== undefined && <FinStat label="Op. Margin" value={pct(c.financials.operatingMargin)} />}
              {c.financials.marketCap && <FinStat label="Market Cap" value={fmt(c.financials.marketCap)} />}
            </div>
          </Section>

          {/* Business model */}
          <Section title="Business Model">
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-3">{c.businessModel}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5">Customer Segments</h4>
                <ul className="space-y-1">
                  {c.customerSegments.map((s, i) => <li key={i} className="text-sm text-slate-600 dark:text-slate-300 flex items-start gap-1.5"><span className="text-brand-500 mt-1">•</span>{s}</li>)}
                </ul>
              </div>
              <div>
                <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5">Revenue Streams</h4>
                <ul className="space-y-1">
                  {c.revenueStreams.map((s, i) => <li key={i} className="text-sm text-slate-600 dark:text-slate-300 flex items-start gap-1.5"><span className="text-emerald-500 mt-1">•</span>{s}</li>)}
                </ul>
              </div>
            </div>
          </Section>

          {/* Products */}
          <Section title="Products & Services">
            <div className="flex flex-wrap gap-2">
              {c.products.map((p, i) => (
                <span key={i} className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 px-2.5 py-1 rounded-lg">{p}</span>
              ))}
            </div>
          </Section>

          {/* Key Value Props */}
          <Section title="Competitive Advantages">
            <ul className="space-y-1.5">
              {c.keyValueProps.map((v, i) => (
                <li key={i} className="text-sm text-slate-600 dark:text-slate-300 flex items-start gap-2">
                  <span className="text-brand-500 font-bold mt-0.5">✓</span>{v}
                </li>
              ))}
            </ul>
          </Section>

          {/* Recent Developments */}
          <Section title="Recent Developments">
            <div className="space-y-3">
              {c.recentDevelopments.map((d, i) => (
                <div key={i} className="flex gap-3">
                  <div className="text-xs text-slate-400 font-mono min-w-[60px] mt-0.5">{d.date}</div>
                  <div>
                    <div className="text-sm font-medium text-slate-800 dark:text-slate-100">{d.headline}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{d.detail}</div>
                  </div>
                </div>
              ))}
            </div>
          </Section>

          {/* Risks */}
          <Section title="Risks & Challenges">
            <ul className="space-y-1.5">
              {c.risks.map((r, i) => (
                <li key={i} className="text-sm text-slate-600 dark:text-slate-300 flex items-start gap-2">
                  <span className="text-red-400 mt-0.5">⚠</span>{r}
                </li>
              ))}
            </ul>
          </Section>

          {/* Key People */}
          <Section title="Key People">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {c.keyPeople.map((p, i) => (
                <div key={i} className="flex items-center gap-2.5 p-2.5 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-600 dark:text-slate-300">
                    {p.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-slate-800 dark:text-slate-100">{p.name}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">{p.role}</div>
                  </div>
                </div>
              ))}
            </div>
          </Section>
        </div>

        {/* Sidebar */}
        <div className="flex flex-col gap-4">
          {/* Tags */}
          <TagPanel companyId={c.id} tags={companyTags} allTags={tags} addTagToCompany={addTagToCompany} removeTagFromCompany={removeTagFromCompany} createTag={createTag} />

          {/* Collections */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
            <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100 mb-3">Collections</h3>
            <div className="space-y-1.5">
              {collections.map(col => {
                const inCol = isInCollection(col.id, c.id);
                return (
                  <button key={col.id} onClick={() => inCol ? removeFromCollection(col.id, c.id) : addToCollection(col.id, c.id)}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left">
                    <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: col.color }} />
                    <span className="text-sm text-slate-700 dark:text-slate-200 flex-1">{col.name}</span>
                    {inCol && <span className="text-xs text-brand-600 font-medium">✓</span>}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Notes */}
          <NotePanel companyId={c.id} note={note} saveNote={saveNote} deleteNote={deleteNote} />

          {/* Data info */}
          <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-3 text-xs text-slate-400 space-y-1">
            <div><span className="font-medium">Last updated:</span> {c.lastUpdated}</div>
            <div><span className="font-medium">Source:</span> {c.dataSource}</div>
            <div><span className="font-medium">Geography:</span> {c.geography.join(', ')}</div>
          </div>
        </div>
      </div>

      {/* Related companies */}
      {related.length > 0 && (
        <div className="mt-6">
          <h2 className="text-base font-semibold text-slate-800 dark:text-slate-100 mb-3">Related Companies</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {related.map(r => <CompanyCard key={r.id} company={r} />)}
          </div>
        </div>
      )}
    </div>
  );
}

function Section({ title, children, badge, novice }: { title: string; children: React.ReactNode; badge?: string; novice?: boolean }) {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <div className={clsx('bg-white dark:bg-slate-900 border rounded-xl overflow-hidden', novice ? 'border-brand-200 dark:border-brand-800' : 'border-slate-200 dark:border-slate-800')}>
      <button onClick={() => setCollapsed(c => !c)} className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100">{title}</h2>
          {badge && <span className="text-xs text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">{badge}</span>}
        </div>
        {collapsed ? <ChevronDown size={15} className="text-slate-400" /> : <ChevronUp size={15} className="text-slate-400" />}
      </button>
      {!collapsed && <div className="px-5 pb-5">{children}</div>}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs text-slate-400 mb-0.5">{label}</div>
      <div className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate" title={value}>{value}</div>
    </div>
  );
}

function FinStat({ label, value, trend }: { label: string; value: string; trend?: 'up' | 'down' }) {
  return (
    <div className="bg-slate-50 dark:bg-slate-800 rounded-lg px-3 py-2.5">
      <div className="text-xs text-slate-400 mb-1">{label}</div>
      <div className={clsx('text-base font-bold flex items-center gap-1',
        trend === 'up' ? 'text-emerald-600 dark:text-emerald-400' : trend === 'down' ? 'text-red-500' : 'text-slate-800 dark:text-slate-100')}>
        {trend === 'up' && <TrendingUp size={13} />}
        {trend === 'down' && <TrendingDown size={13} />}
        {value}
      </div>
    </div>
  );
}

function TagPanel({ companyId, tags: companyTagList, allTags, addTagToCompany, removeTagFromCompany, createTag }: {
  companyId: string;
  tags: Tag[];
  allTags: Tag[];
  addTagToCompany: (cid: string, tid: string) => void;
  removeTagFromCompany: (cid: string, tid: string) => void;
  createTag: (name: string) => Tag;
}) {
  const [input, setInput] = useState('');
  const [showInput, setShowInput] = useState(false);

  const suggestions = allTags.filter(t =>
    !companyTagList.find(ct => ct.id === t.id) &&
    t.name.toLowerCase().includes(input.toLowerCase())
  );

  function add(name: string) {
    const existing = allTags.find(t => t.name.toLowerCase() === name.toLowerCase());
    const tag = existing ?? createTag(name);
    addTagToCompany(companyId, tag.id);
    setInput('');
  }

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
          <TagIcon size={13} /> Tags
        </h3>
        <button onClick={() => setShowInput(s => !s)} className="text-xs text-brand-600 hover:text-brand-700 font-medium flex items-center gap-1">
          <Plus size={12} /> Add
        </button>
      </div>

      <div className="flex flex-wrap gap-1.5 mb-2">
        {companyTagList.map(t => (
          <span key={t.id} className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: t.color }}>
            {t.name}
            <button onClick={() => removeTagFromCompany(companyId, t.id)} className="hover:opacity-70">
              <X size={10} />
            </button>
          </span>
        ))}
        {companyTagList.length === 0 && <span className="text-xs text-slate-400">No tags yet</span>}
      </div>

      {showInput && (
        <div className="relative">
          <input
            autoFocus
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && input.trim()) { add(input.trim()); } }}
            placeholder="Type tag name…"
            className="w-full text-xs border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
          {suggestions.length > 0 && input && (
            <div className="absolute top-full mt-1 left-0 right-0 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg z-10 max-h-36 overflow-y-auto">
              {suggestions.map(t => (
                <button key={t.id} onClick={() => add(t.name)} className="w-full flex items-center gap-2 px-2.5 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 text-left">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: t.color }} />
                  <span className="text-xs text-slate-700 dark:text-slate-200">{t.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function NotePanel({ companyId, note, saveNote, deleteNote }: {
  companyId: string;
  note: Note | undefined;
  saveNote: (cid: string, content: string) => void;
  deleteNote: (nid: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(note?.content ?? '');

  useEffect(() => { setDraft(note?.content ?? ''); }, [note?.content]);

  function save() {
    if (draft.trim()) saveNote(companyId, draft.trim());
    else if (note) deleteNote(note.id);
    setEditing(false);
  }

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
          <FileText size={13} /> Notes
        </h3>
        {!editing && (
          <button onClick={() => setEditing(true)} className="text-xs text-brand-600 hover:text-brand-700 font-medium">
            {note ? 'Edit' : '+ Add note'}
          </button>
        )}
      </div>

      {editing ? (
        <div>
          <textarea
            autoFocus
            value={draft}
            onChange={e => setDraft(e.target.value)}
            rows={4}
            placeholder="Write your research notes here…"
            className="w-full text-xs border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
          />
          <div className="flex gap-2 mt-2">
            <button onClick={save} className="text-xs bg-brand-600 text-white px-2.5 py-1 rounded-lg hover:bg-brand-700 transition-colors">Save</button>
            <button onClick={() => { setEditing(false); setDraft(note?.content ?? ''); }} className="text-xs text-slate-400 hover:text-slate-600 px-2.5 py-1">Cancel</button>
          </div>
        </div>
      ) : note ? (
        <div>
          <p className="text-xs text-slate-600 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">{note.content}</p>
          <div className="text-xs text-slate-400 mt-2">{new Date(note.updatedAt).toLocaleDateString()}</div>
        </div>
      ) : (
        <p className="text-xs text-slate-400">No notes yet. Click "+ Add note" to start.</p>
      )}
    </div>
  );
}
