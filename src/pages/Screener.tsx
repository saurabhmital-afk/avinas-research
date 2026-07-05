import { useState } from 'react';
import { BarChart2, X, Plus } from 'lucide-react';
import { COMPANIES, INDUSTRIES } from '../data/companies';
import CompanyCard from '../components/company/CompanyCard';

type Op = 'gt' | 'lt' | 'eq';

interface Rule {
  id: string;
  field: string;
  op: Op;
  value: string;
}

const FIELDS = [
  { key: 'industry', label: 'Industry', type: 'select' },
  { key: 'type', label: 'Company Type', type: 'select' },
  { key: 'sizeCategory', label: 'Size', type: 'select' },
  { key: 'financials.revenue', label: 'Revenue ($M)', type: 'number' },
  { key: 'financials.revenueGrowth', label: 'Revenue Growth (%)', type: 'number' },
  { key: 'financials.grossMargin', label: 'Gross Margin (%)', type: 'number' },
  { key: 'financials.marketCap', label: 'Market Cap ($M)', type: 'number' },
  { key: 'employees', label: 'Employees', type: 'number' },
  { key: 'founded', label: 'Founded (year)', type: 'number' },
];

function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
  return path.split('.').reduce((acc: unknown, key) => {
    if (acc && typeof acc === 'object') return (acc as Record<string, unknown>)[key];
    return undefined;
  }, obj);
}

function applyRule(company: typeof COMPANIES[0], rule: Rule): boolean {
  const val = getNestedValue(company as unknown as Record<string, unknown>, rule.field);
  const ruleVal = rule.value;

  if (rule.field === 'industry') return val === ruleVal;
  if (rule.field === 'type') return val === ruleVal;
  if (rule.field === 'sizeCategory') return val === ruleVal;

  const numVal = Number(val);
  const numRule = Number(ruleVal);
  if (isNaN(numVal) || isNaN(numRule)) return false;
  if (rule.op === 'gt') return numVal > numRule;
  if (rule.op === 'lt') return numVal < numRule;
  if (rule.op === 'eq') return numVal === numRule;
  return false;
}

function uid() { return Math.random().toString(36).slice(2, 9); }

export default function Screener() {
  const [rules, setRules] = useState<Rule[]>([]);

  function addRule() {
    setRules(r => [...r, { id: uid(), field: 'industry', op: 'eq', value: INDUSTRIES[0] }]);
  }

  function updateRule(id: string, patch: Partial<Rule>) {
    setRules(r => r.map(rule => rule.id === id ? { ...rule, ...patch } : rule));
  }

  function removeRule(id: string) {
    setRules(r => r.filter(rule => rule.id !== id));
  }

  const results = rules.length === 0
    ? COMPANIES
    : COMPANIES.filter(c => rules.every(r => applyRule(c, r)));

  const fieldMeta = (key: string) => FIELDS.find(f => f.key === key);

  return (
    <div className="p-6">
      <div className="flex items-center gap-2 mb-2">
        <BarChart2 size={20} className="text-brand-600" />
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">Screener</h1>
      </div>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-5">Build multi-criteria filters to find companies matching your criteria.</p>

      {/* Rules */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 mb-5">
        {rules.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-4">No filters added. Click "Add filter" to start screening.</p>
        ) : (
          <div className="flex flex-col gap-2 mb-3">
            {rules.map((rule, i) => {
              const meta = fieldMeta(rule.field);
              return (
                <div key={rule.id} className="flex items-center gap-2 flex-wrap">
                  {i > 0 && <span className="text-xs font-medium text-slate-400 w-8">AND</span>}
                  {i === 0 && <span className="text-xs font-medium text-slate-400 w-8">WHERE</span>}

                  {/* Field */}
                  <select value={rule.field} onChange={e => updateRule(rule.id, { field: e.target.value, value: '' })}
                    className="text-sm border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1.5 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500">
                    {FIELDS.map(f => <option key={f.key} value={f.key}>{f.label}</option>)}
                  </select>

                  {/* Operator (only for number fields) */}
                  {meta?.type === 'number' && (
                    <select value={rule.op} onChange={e => updateRule(rule.id, { op: e.target.value as Op })}
                      className="text-sm border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1.5 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500">
                      <option value="gt">greater than</option>
                      <option value="lt">less than</option>
                      <option value="eq">equals</option>
                    </select>
                  )}
                  {meta?.type === 'select' && (
                    <span className="text-sm text-slate-400">is</span>
                  )}

                  {/* Value */}
                  {meta?.type === 'select' && rule.field === 'industry' && (
                    <select value={rule.value} onChange={e => updateRule(rule.id, { value: e.target.value })}
                      className="text-sm border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1.5 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500">
                      {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
                    </select>
                  )}
                  {meta?.type === 'select' && rule.field === 'type' && (
                    <select value={rule.value} onChange={e => updateRule(rule.id, { value: e.target.value })}
                      className="text-sm border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1.5 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none">
                      <option value="public">Public</option>
                      <option value="private">Private</option>
                    </select>
                  )}
                  {meta?.type === 'select' && rule.field === 'sizeCategory' && (
                    <select value={rule.value} onChange={e => updateRule(rule.id, { value: e.target.value })}
                      className="text-sm border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1.5 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none">
                      {['startup', 'smb', 'mid-market', 'large', 'enterprise'].map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  )}
                  {meta?.type === 'number' && (
                    <input type="number" value={rule.value} onChange={e => updateRule(rule.id, { value: e.target.value })}
                      placeholder="Value"
                      className="text-sm border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 w-28" />
                  )}

                  <button onClick={() => removeRule(rule.id)} className="text-slate-300 hover:text-red-400 transition-colors">
                    <X size={14} />
                  </button>
                </div>
              );
            })}
          </div>
        )}

        <button onClick={addRule} className="flex items-center gap-1.5 text-sm text-brand-600 hover:text-brand-700 font-medium">
          <Plus size={14} /> Add filter
        </button>
      </div>

      {/* Results */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{results.length} companies match</span>
        {rules.length > 0 && (
          <button onClick={() => setRules([])} className="text-xs text-slate-400 hover:text-slate-600">Clear all filters</button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {results.map(c => <CompanyCard key={c.id} company={c} />)}
      </div>
    </div>
  );
}
