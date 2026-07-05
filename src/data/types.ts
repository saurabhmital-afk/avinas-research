export type CompanyType = 'public' | 'private';
export type SizeCategory = 'startup' | 'smb' | 'mid-market' | 'large' | 'enterprise';

export interface Financial {
  revenue?: number;        // millions USD
  revenueGrowth?: number;  // % YoY
  netIncome?: number;      // millions USD
  grossMargin?: number;    // %
  operatingMargin?: number;// %
  marketCap?: number;      // millions USD
  aum?: number;            // millions USD (asset managers)
  ebitda?: number;         // millions USD
  fiscalYearEnd?: string;  // e.g. "January" for non-calendar
  asOf?: string;           // e.g. "FY2025"
}

export interface Company {
  id: string;
  name: string;
  ticker?: string;
  exchange?: string;
  type: CompanyType;
  industry: string;
  sector: string;
  tags: string[];          // system discovery tags
  shortDescription: string; // 1-2 sentences, novice-friendly
  description: string;     // full paragraph
  noviceSummary: string;   // "explain in 2 min" plain-language summary
  headquarters: string;
  founded: number;
  employees: number;
  website: string;
  logoInitials: string;    // e.g. "CB" for CBRE
  logoColor: string;       // Tailwind bg color class
  ceo: string;
  keyPeople: { name: string; role: string }[];
  sizeCategory: SizeCategory;
  geography: string[];
  financials: Financial;
  businessModel: string;
  customerSegments: string[];
  revenueStreams: string[];
  keyValueProps: string[];
  products: string[];
  competitors: string[];   // company IDs
  recentDevelopments: { date: string; headline: string; detail: string }[];
  risks: string[];
  lastUpdated: string;
  dataSource: string;
}
