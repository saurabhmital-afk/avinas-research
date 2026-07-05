import { useState, useRef, useCallback, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FlaskConical, ChevronRight, Check, X, Copy, Loader2, AlertCircle, BookOpen, Users, ChevronDown, ChevronUp, RotateCcw, Eye, EyeOff, Trash2 } from 'lucide-react';
import { useStore } from '../store/useStore';
import {
  generatePrompt,
  OVERVIEW_FOCUS_AREAS,
  USER_RESEARCH_FOCUS_AREAS,
  type ResearchType,
  type ResearchRequest,
} from '../lib/promptGenerator';
import { streamResearch } from '../lib/claudeApi';
import type { ResearchRecord } from '../store/useStore';
import clsx from 'clsx';

type Phase = 'form' | 'prompt-review' | 'executing' | 'complete';

function uid() { return Math.random().toString(36).slice(2, 11); }

export default function Research() {
  const { claudeApiKey, researchRecords, deleteResearchRecord, updateResearchRecord } = useStore();
  const [phase, setPhase] = useState<Phase>('form');
  const [activeRecordId, setActiveRecordId] = useState<string | null>(null);
  const [viewingId, setViewingId] = useState<string | null>(null);

  const activeRecord = researchRecords.find(r => r.id === activeRecordId);
  const viewingRecord = researchRecords.find(r => r.id === viewingId);

  if (viewingRecord && viewingId && viewingId !== activeRecordId) {
    return <RecordViewer record={viewingRecord} onClose={() => setViewingId(null)} />;
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-2 mb-1">
        <FlaskConical size={20} className="text-brand-600" />
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">Research a Company</h1>
      </div>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
        Enter any company name, choose a research type, and Avina's Research will generate a structured prompt and execute the research using Claude.
      </p>

      {!claudeApiKey && (
        <ApiKeyNotice />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Main panel */}
        <div className="lg:col-span-2">
          {phase === 'form' && (
            <ResearchForm
              onGenerate={(_req, recordId) => {
                setActiveRecordId(recordId);
                setPhase('prompt-review');
              }}
            />
          )}
          {phase === 'prompt-review' && activeRecord && (
            <PromptReview
              record={activeRecord}
              onApprove={() => setPhase('executing')}
              onEdit={() => setPhase('form')}
              onCancel={() => { setPhase('form'); setActiveRecordId(null); }}
              onUpdatePrompt={(prompt) => updateResearchRecord(activeRecord.id, { prompt })}
            />
          )}
          {(phase === 'executing' || phase === 'complete') && activeRecord && (
            <ExecutionPanel
              record={activeRecord}
              onChunk={() => {}}
              onDone={(report) => {
                updateResearchRecord(activeRecord.id, { report, status: 'complete' });
                setPhase('complete');
              }}
              onError={() => setPhase('prompt-review')}
              onReset={() => { setPhase('form'); setActiveRecordId(null); }}
            />
          )}
        </div>

        {/* History sidebar */}
        <div>
          <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-3">Research History</h2>
          {researchRecords.length === 0 ? (
            <div className="text-xs text-slate-400 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-4 text-center">
              No research yet. Complete your first research request to see it here.
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {[...researchRecords].reverse().map(r => (
                <div key={r.id} className={clsx(
                  'bg-white dark:bg-slate-900 border rounded-xl p-3 transition-colors',
                  r.id === activeRecordId ? 'border-brand-300 dark:border-brand-700' : 'border-slate-200 dark:border-slate-800'
                )}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-slate-800 dark:text-slate-100 truncate">{r.companyName}</div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className={clsx('text-xs px-1.5 py-0.5 rounded font-medium',
                          r.researchType === 'overview'
                            ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                            : 'bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400')}>
                          {r.researchType === 'overview' ? 'Overview' : 'User Research'}
                        </span>
                        <span className={clsx('text-xs', r.status === 'complete' ? 'text-emerald-500' : 'text-slate-400')}>
                          {r.status === 'complete' ? '✓ Complete' : '⏳ Draft'}
                        </span>
                      </div>
                      <div className="text-xs text-slate-400 mt-1">{new Date(r.createdAt).toLocaleDateString()}</div>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {r.status === 'complete' && (
                        <button onClick={() => setViewingId(r.id)} title="View report"
                          className="w-6 h-6 flex items-center justify-center text-slate-400 hover:text-brand-600 transition-colors">
                          <Eye size={13} />
                        </button>
                      )}
                      <button onClick={() => deleteResearchRecord(r.id)} title="Delete"
                        className="w-6 h-6 flex items-center justify-center text-slate-400 hover:text-red-500 transition-colors">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Tips */}
          <div className="mt-4 bg-brand-50 dark:bg-brand-900/20 rounded-xl p-3 text-xs text-brand-700 dark:text-brand-400 space-y-1">
            <div className="font-semibold mb-1.5">Tips</div>
            <div>• Use <strong>Company Overview</strong> for strategy, financials, and market position</div>
            <div>• Use <strong>User Research</strong> for client pain points, personas, and information asymmetry dynamics</div>
            <div>• Focus Areas let you tell Claude which sections to go deepest on</div>
            <div>• Custom Instructions override or extend any part of the research scope</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Phase 0: API Key Notice ────────────────────────────────────────────────

function ApiKeyNotice() {
  return (
    <div className="flex items-start gap-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 mb-5 text-sm">
      <AlertCircle size={16} className="text-slate-400 flex-shrink-0 mt-0.5" />
      <div className="text-slate-600 dark:text-slate-400">
        A Claude API key is required to execute research. You'll be prompted to enter it when you click <strong>Approve & Execute</strong>. You can also save it permanently in{' '}
        <Link to="/settings" className="text-brand-600 hover:underline">Settings</Link>.
      </div>
    </div>
  );
}

// ─── Phase 1: Research Form ─────────────────────────────────────────────────

function ResearchForm({ onGenerate }: { onGenerate: (req: ResearchRequest, recordId: string) => void }) {
  const { saveResearchRecord } = useStore();
  const [companyName, setCompanyName] = useState('');
  const [companyType, setCompanyType] = useState<'public' | 'private' | 'unknown'>('unknown');
  const [ticker, setTicker] = useState('');
  const [exchange, setExchange] = useState('');
  const [researchType, setResearchType] = useState<ResearchType>('overview');
  const [focusAreas, setFocusAreas] = useState<string[]>([]);
  const [customInstructions, setCustomInstructions] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [error, setError] = useState('');

  const allFocusAreas = researchType === 'overview' ? OVERVIEW_FOCUS_AREAS : USER_RESEARCH_FOCUS_AREAS;

  function toggleFocus(area: string) {
    setFocusAreas(f => f.includes(area) ? f.filter(a => a !== area) : [...f, area]);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!companyName.trim()) { setError('Company name is required'); return; }
    setError('');

    const req: ResearchRequest = {
      companyName: companyName.trim(),
      companyType,
      ticker: ticker.trim() || undefined,
      exchange: exchange.trim() || undefined,
      researchType,
      focusAreas,
      customInstructions,
    };

    const prompt = generatePrompt(req);
    const id = uid();

    const record: ResearchRecord = {
      id,
      companyName: req.companyName,
      researchType: req.researchType,
      focusAreas: req.focusAreas,
      customInstructions: req.customInstructions,
      prompt,
      report: '',
      createdAt: new Date().toISOString(),
      status: 'draft',
    };

    saveResearchRecord(record);
    onGenerate(req, id);
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5">
      <h2 className="text-base font-semibold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
        <span className="w-6 h-6 rounded-full bg-brand-600 text-white text-xs flex items-center justify-center font-bold">1</span>
        Define Your Research Request
      </h2>

      {/* Company name */}
      <div className="mb-4">
        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5 uppercase tracking-wide">
          Company Name <span className="text-red-400">*</span>
        </label>
        <input
          value={companyName}
          onChange={e => { setCompanyName(e.target.value); setError(''); }}
          placeholder="e.g. Palantir Technologies, Shopify, Klarna…"
          className="w-full px-3 py-2.5 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
        {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
      </div>

      {/* Company type */}
      <div className="mb-4">
        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5 uppercase tracking-wide">Company Type</label>
        <div className="flex gap-2">
          {(['unknown', 'public', 'private'] as const).map(t => (
            <button key={t} type="button" onClick={() => setCompanyType(t)}
              className={clsx('flex-1 py-2 text-sm rounded-lg border transition-colors font-medium',
                companyType === t
                  ? 'bg-brand-600 text-white border-brand-600'
                  : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-brand-300')}>
              {t === 'unknown' ? 'Unknown' : t === 'public' ? 'Public (Listed)' : 'Private'}
            </button>
          ))}
        </div>
        {companyType === 'public' && (
          <div className="flex gap-2 mt-2">
            <input value={ticker} onChange={e => setTicker(e.target.value.toUpperCase())} placeholder="Ticker (e.g. AAPL)"
              className="flex-1 px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500 font-mono" />
            <input value={exchange} onChange={e => setExchange(e.target.value.toUpperCase())} placeholder="Exchange (e.g. NYSE)"
              className="flex-1 px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500" />
          </div>
        )}
      </div>

      {/* Research type */}
      <div className="mb-4">
        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-2 uppercase tracking-wide">Research Type</label>
        <div className="grid grid-cols-2 gap-3">
          <ResearchTypeCard
            type="overview"
            selected={researchType === 'overview'}
            onSelect={() => { setResearchType('overview'); setFocusAreas([]); }}
            icon={<BookOpen size={18} />}
            title="Company Overview"
            description="Strategy, financials, business model, competitors, risks, key people."
          />
          <ResearchTypeCard
            type="user-research"
            selected={researchType === 'user-research'}
            onSelect={() => { setResearchType('user-research'); setFocusAreas([]); }}
            icon={<Users size={18} />}
            title="User Research"
            description="Client personas, pain points, information asymmetry, satisfaction signals."
          />
        </div>
      </div>

      {/* Focus areas */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wide">
            Focus Areas <span className="text-slate-400 font-normal normal-case">(optional — all included by default)</span>
          </label>
          {focusAreas.length > 0 && (
            <button type="button" onClick={() => setFocusAreas([])} className="text-xs text-slate-400 hover:text-slate-600">Clear</button>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {allFocusAreas.map(area => (
            <button key={area} type="button" onClick={() => toggleFocus(area)}
              className={clsx('text-xs px-2.5 py-1 rounded-full border transition-colors',
                focusAreas.includes(area)
                  ? 'bg-brand-600 text-white border-brand-600'
                  : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-brand-400 hover:text-brand-600')}>
              {focusAreas.includes(area) && <Check size={10} className="inline mr-1" />}
              {area}
            </button>
          ))}
        </div>
        {focusAreas.length > 0 && (
          <p className="text-xs text-brand-600 mt-1.5">Claude will prioritise depth on the {focusAreas.length} selected section{focusAreas.length > 1 ? 's' : ''}.</p>
        )}
      </div>

      {/* Advanced: custom instructions */}
      <div className="mb-5">
        <button type="button" onClick={() => setShowAdvanced(s => !s)}
          className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 mb-2">
          {showAdvanced ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          Custom Instructions (optional)
        </button>
        {showAdvanced && (
          <textarea
            value={customInstructions}
            onChange={e => setCustomInstructions(e.target.value)}
            rows={3}
            placeholder="e.g. 'Focus especially on the European logistics strategy and M7 subsidiary.' or 'Include a section on the impact of US tariffs on gross margin.' or 'Compare financial metrics to Salesforce and ServiceNow.'"
            className="w-full px-3 py-2.5 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
          />
        )}
      </div>

      <button type="submit"
        className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold rounded-xl transition-colors">
        Generate Research Prompt
        <ChevronRight size={16} />
      </button>
    </form>
  );
}

function ResearchTypeCard({ selected, onSelect, icon, title, description }: {
  type?: ResearchType; selected: boolean; onSelect: () => void;
  icon: React.ReactNode; title: string; description: string;
}) {
  return (
    <button type="button" onClick={onSelect}
      className={clsx('text-left p-3.5 rounded-xl border-2 transition-all',
        selected ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20' : 'border-slate-200 dark:border-slate-700 hover:border-brand-300')}>
      <div className={clsx('flex items-center gap-2 mb-1.5', selected ? 'text-brand-600' : 'text-slate-500')}>
        {icon}
        <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">{title}</span>
      </div>
      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{description}</p>
    </button>
  );
}

// ─── Phase 2: Prompt Review ─────────────────────────────────────────────────

function PromptReview({ record, onApprove, onEdit, onCancel, onUpdatePrompt }: {
  record: ResearchRecord;
  onApprove: () => void;
  onEdit: () => void;
  onCancel: () => void;
  onUpdatePrompt: (p: string) => void;
}) {
  const { claudeApiKey, setClaudeApiKey } = useStore();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(record.prompt);
  const [copied, setCopied] = useState(false);
  const [showKeyInput, setShowKeyInput] = useState(false);
  const [keyDraft, setKeyDraft] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [keyError, setKeyError] = useState('');

  function copy() {
    navigator.clipboard.writeText(record.prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function saveEdit() {
    onUpdatePrompt(draft);
    setEditing(false);
  }

  function handleApprove() {
    if (!claudeApiKey) {
      setShowKeyInput(true);
      return;
    }
    onApprove();
  }

  function handleSaveKeyAndApprove() {
    const trimmed = keyDraft.trim();
    if (!trimmed) {
      setKeyError('Please enter your Claude API key');
      return;
    }
    setKeyError('');
    setClaudeApiKey(trimmed);
    onApprove();
  }

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-1">
        <span className="w-6 h-6 rounded-full bg-brand-600 text-white text-xs flex items-center justify-center font-bold">2</span>
        <h2 className="text-base font-semibold text-slate-800 dark:text-slate-100">Review Research Prompt</h2>
      </div>
      <p className="text-xs text-slate-400 mb-4 ml-8">
        This prompt was generated following the structured research framework. Review it, edit if needed, then approve to execute.
      </p>

      {/* Prompt display */}
      <div className="relative mb-4">
        {editing ? (
          <div>
            <textarea
              value={draft}
              onChange={e => setDraft(e.target.value)}
              rows={20}
              className="w-full px-3 py-2.5 text-xs font-mono border border-brand-300 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
            />
            <div className="flex gap-2 mt-2">
              <button onClick={saveEdit} className="text-xs bg-brand-600 text-white px-3 py-1.5 rounded-lg hover:bg-brand-700 transition-colors">Save changes</button>
              <button onClick={() => { setDraft(record.prompt); setEditing(false); }} className="text-xs text-slate-400 hover:text-slate-600 px-2">Cancel</button>
            </div>
          </div>
        ) : (
          <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 max-h-80 overflow-y-auto">
            <pre className="text-xs text-slate-700 dark:text-slate-200 whitespace-pre-wrap font-mono leading-relaxed">{record.prompt}</pre>
          </div>
        )}

        {!editing && (
          <div className="flex gap-2 mt-2 justify-end">
            <button onClick={() => setEditing(true)} className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 flex items-center gap-1">
              Edit prompt
            </button>
            <button onClick={copy} className={clsx('text-xs flex items-center gap-1 transition-colors', copied ? 'text-emerald-600' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-200')}>
              <Copy size={12} /> {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
        )}
      </div>

      {/* Inline API key entry (shown when key missing and user clicks Approve) */}
      {showKeyInput && !claudeApiKey && (
        <div className="mb-4 p-4 bg-brand-50 dark:bg-brand-900/20 border border-brand-200 dark:border-brand-800 rounded-xl">
          <p className="text-xs font-semibold text-brand-800 dark:text-brand-300 mb-2">Enter your Claude API key to execute</p>
          <p className="text-xs text-brand-700 dark:text-brand-400 mb-3">
            Your key is stored locally in your browser and sent only to the Anthropic API.{' '}
            <a href="https://console.anthropic.com/settings/keys" target="_blank" rel="noopener noreferrer" className="underline">Get a key →</a>
          </p>
          <div className="flex gap-2 mb-2">
            <div className="relative flex-1">
              <input
                autoFocus
                type={showKey ? 'text' : 'password'}
                value={keyDraft}
                onChange={e => { setKeyDraft(e.target.value); setKeyError(''); }}
                onKeyDown={e => e.key === 'Enter' && handleSaveKeyAndApprove()}
                placeholder="sk-ant-…"
                className="w-full pr-9 pl-3 py-2 text-sm border border-brand-300 dark:border-brand-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-mono focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
              <button type="button" onClick={() => setShowKey(s => !s)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                {showKey ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
            <button onClick={handleSaveKeyAndApprove}
              className="flex items-center gap-1.5 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold rounded-lg transition-colors flex-shrink-0">
              <Check size={14} /> Execute
            </button>
          </div>
          {keyError && <p className="text-xs text-red-500">{keyError}</p>}
        </div>
      )}

      {/* Action row */}
      <div className="flex flex-wrap items-center gap-3">
        <button onClick={handleApprove}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors bg-brand-600 hover:bg-brand-700 text-white">
          <Check size={15} />
          Approve & Execute Research
        </button>

        <div className="flex gap-2 ml-auto">
          <button onClick={onEdit} className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex items-center gap-1">
            <RotateCcw size={12} /> Edit request
          </button>
          <button onClick={onCancel} className="text-xs text-slate-400 hover:text-red-500 flex items-center gap-1">
            <X size={12} /> Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Phase 3+4: Execution & Result ─────────────────────────────────────────

function ExecutionPanel({ record, onChunk, onDone, onError, onReset }: {
  record: ResearchRecord;
  onChunk: (text: string) => void;
  onDone: (full: string) => void;
  onError: () => void;
  onReset: () => void;
}) {
  const [status, setStatus] = useState<'running' | 'done' | 'error'>('running');
  const [errorMsg, setErrorMsg] = useState('');
  const [report, setReport] = useState('');
  const [copied, setCopied] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const hasStarted = useRef(false);

  const start = useCallback(async () => {
    if (hasStarted.current) return;
    hasStarted.current = true;

    // Read key fresh from store to avoid stale closure when key was entered inline
    const key = useStore.getState().claudeApiKey;
    if (!key) {
      setErrorMsg('No API key found. Go back and enter your Claude API key.');
      setStatus('error');
      return;
    }

    const controller = new AbortController();
    abortRef.current = controller;

    await streamResearch(
      key,
      record.prompt,
      {
        onChunk: (text) => {
          setReport(prev => prev + text);
          onChunk(text);
        },
        onDone: (full) => {
          setStatus('done');
          onDone(full);
        },
        onError: (msg) => {
          // Only update internal state — don't navigate away so the user can read the error
          setErrorMsg(msg);
          setStatus('error');
        },
      },
      controller.signal
    );
  }, []); // eslint-disable-line

  // Start on mount
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { start(); }, []);

  function copy() {
    navigator.clipboard.writeText(report);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function abort() {
    abortRef.current?.abort();
    setStatus('error');
    setErrorMsg('Research cancelled by user.');
  }

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <span className="w-6 h-6 rounded-full bg-brand-600 text-white text-xs flex items-center justify-center font-bold">3</span>
        <h2 className="text-base font-semibold text-slate-800 dark:text-slate-100">
          {status === 'running' && (
            <span className="flex items-center gap-2">
              <Loader2 size={15} className="animate-spin text-brand-500" />
              Researching {record.companyName}…
            </span>
          )}
          {status === 'done' && `Research Complete — ${record.companyName}`}
          {status === 'error' && 'Research Error'}
        </h2>
      </div>

      {status === 'error' && (
        <div className="flex items-start gap-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-3 mb-4 text-sm text-red-700 dark:text-red-400">
          <AlertCircle size={15} className="flex-shrink-0 mt-0.5" />
          <div>
            <div className="font-medium">Research failed</div>
            <div className="text-xs mt-0.5">{errorMsg}</div>
          </div>
        </div>
      )}

      {/* Streaming output */}
      {(report || status === 'running') && (
        <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 mb-4 max-h-[60vh] overflow-y-auto">
          <pre className="text-xs text-slate-700 dark:text-slate-200 whitespace-pre-wrap font-sans leading-relaxed">
            {report || ' '}
            {status === 'running' && <span className="inline-block w-2 h-3.5 bg-brand-500 ml-0.5 animate-pulse align-middle" />}
          </pre>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-wrap gap-2">
        {status === 'running' && (
          <button onClick={abort} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-sm text-slate-500 hover:text-red-600 hover:border-red-300 transition-colors">
            <X size={14} /> Stop
          </button>
        )}
        {status === 'done' && (
          <>
            <button onClick={copy} className={clsx('flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border',
              copied ? 'border-emerald-300 text-emerald-600 bg-emerald-50' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-slate-300')}>
              <Copy size={14} /> {copied ? 'Copied!' : 'Copy report'}
            </button>
            <button onClick={onReset} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 transition-colors">
              <FlaskConical size={14} /> New research
            </button>
          </>
        )}
        {status === 'error' && (
          <button onClick={onError} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm bg-brand-600 text-white hover:bg-brand-700 transition-colors">
            <RotateCcw size={14} /> Back to prompt
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Record Viewer ──────────────────────────────────────────────────────────

function RecordViewer({ record, onClose }: { record: ResearchRecord; onClose: () => void }) {
  const [copied, setCopied] = useState(false);

  function copy() {
    navigator.clipboard.writeText(record.report);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <div>
          <button onClick={onClose} className="text-xs text-slate-400 hover:text-brand-600 mb-1 block">← Back to Research</button>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">{record.companyName}</h1>
          <div className="flex items-center gap-2 mt-1">
            <span className={clsx('text-xs px-1.5 py-0.5 rounded font-medium',
              record.researchType === 'overview' ? 'bg-blue-50 text-blue-700' : 'bg-purple-50 text-purple-700')}>
              {record.researchType === 'overview' ? 'Company Overview' : 'User Research'}
            </span>
            <span className="text-xs text-slate-400">{new Date(record.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
        <button onClick={copy} className={clsx('flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm border transition-colors',
          copied ? 'border-emerald-300 text-emerald-600' : 'border-slate-200 dark:border-slate-700 text-slate-500 hover:border-slate-300')}>
          <Copy size={14} /> {copied ? 'Copied!' : 'Copy report'}
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
        <pre className="text-sm text-slate-700 dark:text-slate-200 whitespace-pre-wrap font-sans leading-relaxed">{record.report}</pre>
      </div>
    </div>
  );
}
