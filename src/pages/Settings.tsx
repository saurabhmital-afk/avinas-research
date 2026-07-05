import { useState } from 'react';
import { useStore } from '../store/useStore';
import { Moon, Sun, Sliders, LayoutGrid, Key, Eye, EyeOff, CheckCircle } from 'lucide-react';
import clsx from 'clsx';

export default function Settings() {
  const { darkMode, toggleDarkMode, advancedMode, toggleAdvancedMode, claudeApiKey, setClaudeApiKey } = useStore();
  const [keyDraft, setKeyDraft] = useState(claudeApiKey);
  const [showKey, setShowKey] = useState(false);
  const [keySaved, setKeySaved] = useState(false);

  function saveKey() {
    setClaudeApiKey(keyDraft.trim());
    setKeySaved(true);
    setTimeout(() => setKeySaved(false), 2000);
  }

  return (
    <div className="p-6 max-w-xl">
      <h1 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Settings</h1>

      {/* API Key */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 mb-4">
        <div className="flex items-center gap-2 mb-1">
          <Key size={15} className="text-slate-400" />
          <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">Claude API Key</span>
          {claudeApiKey && <CheckCircle size={14} className="text-emerald-500" />}
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
          Required for AI-powered company research. Your key is stored locally in your browser and never sent anywhere except the Anthropic API.{' '}
          <a href="https://console.anthropic.com/settings/keys" target="_blank" rel="noopener noreferrer" className="text-brand-600 hover:underline">Get a key →</a>
        </p>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <input
              type={showKey ? 'text' : 'password'}
              value={keyDraft}
              onChange={e => { setKeyDraft(e.target.value); setKeySaved(false); }}
              placeholder="sk-ant-…"
              className="w-full pr-9 pl-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
            <button onClick={() => setShowKey(s => !s)} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
              {showKey ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>
          <button onClick={saveKey}
            className={clsx('px-3 py-2 rounded-lg text-sm font-medium transition-colors flex-shrink-0',
              keySaved ? 'bg-emerald-600 text-white' : 'bg-brand-600 hover:bg-brand-700 text-white')}>
            {keySaved ? '✓ Saved' : 'Save'}
          </button>
        </div>
        {claudeApiKey && (
          <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-2 flex items-center gap-1">
            <CheckCircle size={11} /> API key configured — research execution is enabled.
          </p>
        )}
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden mb-4">
        <SettingRow
          icon={darkMode ? <Moon size={16} /> : <Sun size={16} />}
          title="Dark mode"
          description="Switch between light and dark interface"
          action={<Toggle on={darkMode} onChange={toggleDarkMode} />}
        />
        <SettingRow
          icon={<Sliders size={16} />}
          title="Advanced mode"
          description="Show detailed financials, segment data, and advanced filters. Novice mode shows simplified summaries."
          action={<Toggle on={advancedMode} onChange={toggleAdvancedMode} />}
          divider={false}
        />
      </div>

      <div className="mt-6 p-4 bg-brand-50 dark:bg-brand-900/20 rounded-xl border border-brand-100 dark:border-brand-800">
        <div className="flex items-center gap-2 mb-2">
          <LayoutGrid size={14} className="text-brand-600" />
          <span className="text-sm font-semibold text-brand-700 dark:text-brand-400">About Avina's Research</span>
        </div>
        <p className="text-xs text-brand-600 dark:text-brand-400 leading-relaxed">
          All your data (favorites, collections, tags, notes) is stored locally in your browser via localStorage.
          No account required. Clear your browser storage to reset all data.
        </p>
        <div className="mt-3 text-xs text-brand-500 dark:text-brand-500">
          v1.0 — Lightweight Edition · {new Date().toLocaleDateString()}
        </div>
      </div>
    </div>
  );
}

function SettingRow({ icon, title, description, action, divider = true }: {
  icon: React.ReactNode;
  title: string;
  description: string;
  action: React.ReactNode;
  divider?: boolean;
}) {
  return (
    <div className={clsx('flex items-center justify-between gap-4 px-5 py-4', divider && 'border-b border-slate-100 dark:border-slate-800')}>
      <div className="flex items-start gap-3">
        <div className="text-slate-400 mt-0.5">{icon}</div>
        <div>
          <div className="text-sm font-medium text-slate-800 dark:text-slate-100">{title}</div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{description}</div>
        </div>
      </div>
      {action}
    </div>
  );
}

function Toggle({ on, onChange }: { on: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      className={clsx(
        'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2',
        on ? 'bg-brand-600' : 'bg-slate-200 dark:bg-slate-700'
      )}
    >
      <span className={clsx(
        'pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
        on ? 'translate-x-5' : 'translate-x-0'
      )} />
    </button>
  );
}
