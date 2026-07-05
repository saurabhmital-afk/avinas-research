export type ResearchType = 'overview' | 'user-research';

export interface ResearchRequest {
  companyName: string;
  companyType: 'public' | 'private' | 'unknown';
  ticker?: string;
  exchange?: string;
  researchType: ResearchType;
  focusAreas: string[];
  customInstructions: string;
}

export const OVERVIEW_FOCUS_AREAS = [
  'Company Overview',
  'Financial Snapshot',
  'Business Model',
  'Products & Services',
  'Market Position & Competitive Landscape',
  'Recent Developments (Last 24 Months)',
  'Strategic Initiatives & Outlook',
  'Risks & Challenges',
  'Key People',
  'Data Gaps & Limitations',
];

export const USER_RESEARCH_FOCUS_AREAS = [
  'Client Segmentation',
  'User Personas',
  'Jobs-to-Be-Done',
  'Pain Points & Unmet Needs (incl. Information Asymmetry)',
  'Client Satisfaction & Reputation Signals',
  'Customer Journey & Key Touchpoints',
  'Competitive Preference Drivers',
  'Emerging Client Needs & Trends',
  'Geographic & Sector Variations',
  'Data Gaps & Limitations',
];

export function generatePrompt(req: ResearchRequest): string {
  const { companyName, companyType, ticker, exchange, researchType, focusAreas, customInstructions } = req;

  const companyRef = ticker
    ? `${companyName} (${exchange ? exchange + ':' : ''}${ticker})`
    : companyName;

  const isPublic = companyType === 'public';
  const isPrivate = companyType === 'private';

  const today = new Date().toISOString().split('T')[0];
  const cutoffYear = new Date().getFullYear() - 2;

  const focusNote = focusAreas.length > 0 && focusAreas.length < (researchType === 'overview' ? OVERVIEW_FOCUS_AREAS.length : USER_RESEARCH_FOCUS_AREAS.length)
    ? `\n\nFOCUS AREAS REQUESTED:\nPrioritise depth on these sections: ${focusAreas.join(', ')}. Still include all other sections but keep them concise if space is limited.`
    : '';

  const customNote = customInstructions.trim()
    ? `\n\nADDITIONAL INSTRUCTIONS FROM REQUESTER:\n${customInstructions.trim()}`
    : '';

  const companyTypeNote = isPublic
    ? `COMPANY TYPE: Publicly traded. Use SEC filings (10-K, 8-K, DEF 14A proxy), earnings releases, and official IR materials as primary financial sources.`
    : isPrivate
    ? `COMPANY TYPE: Privately held. Full audited financials are not publicly disclosed. For the Financial Snapshot, state upfront that audited financials are unavailable. Report only confirmed public figures (AUM, disclosed transaction values, press release figures). Do NOT estimate revenue, EBITDA, or net income without a confirmed public source.`
    : `COMPANY TYPE: Confirm whether the company is publicly traded or privately held before beginning research — this affects the financial data approach significantly.`;

  if (researchType === 'overview') {
    return `---
RESEARCH PROMPT — COMPANY OVERVIEW
Generated: ${today}
---

ROLE:
You are a senior business analyst and market intelligence researcher with expertise in corporate strategy, financial analysis, competitive intelligence, and industry dynamics.

GOAL:
Conduct a comprehensive, structured research report on ${companyRef}. The report must be grounded in verifiable, publicly available information from the last 24 months (${cutoffYear}–present). It must be analytical, not merely descriptive, and must surface actionable insights.

${companyTypeNote}${focusNote}${customNote}

INSTRUCTIONS:

1. Company Overview — Provide a factual summary: legal name, headquarters, founding year, industry/sector, ownership structure (public/private), primary business lines, and employee count. For publicly traded companies, include the stock exchange and ticker symbol.

2. Financial Snapshot — Report recent revenue, profitability, growth trajectory, and key financial ratios where publicly available. Label estimates and unavailable data explicitly.
   - IMPORTANT: If the company uses a non-calendar fiscal year (e.g., ends in January, March, or June), identify and label this convention clearly at the top of this section and apply it consistently throughout the report.
   ${isPublic ? '- For PUBLIC companies: prioritise SEC filings (10-K, 8-K) and official earnings releases for all financial data. Include stock performance context (52-week range or YTD share price movement) where relevant.' : ''}
   ${isPrivate ? '- For PRIVATE companies: state upfront that audited financials are not publicly disclosed. Report only confirmed figures from official announcements. Do not estimate revenue or profitability.' : ''}

3. Business Model — Describe how the company generates revenue, its customer segments, pricing model, and key value propositions.

4. Products & Services — List and briefly describe primary offerings, differentiators, and recent launches or discontinuations.

5. Market Position & Competitive Landscape — Identify the company's position in its industry, key competitors, estimated market share (labelled if estimated), and competitive advantages or disadvantages.
   - For each named competitor, attempt to source their most recent revenue figure with date. If unavailable, note the last known figure and year.
   - Distinguish between company-reported market share and third-party estimated market share.

6. Recent Developments (Last 24 Months) — Cover significant news: acquisitions, partnerships, leadership changes, regulatory actions, product launches, layoffs, expansions, or strategic pivots.

7. Strategic Initiatives & Outlook — Describe stated strategic priorities, growth initiatives, and forward-looking statements. Label projections clearly.
   - Include any publicly stated ESG, sustainability, or net zero commitments as a dedicated sub-item.

8. Risks & Challenges — Identify material risks: competitive, regulatory, macroeconomic, operational, or reputational.

9. Key People — List current C-suite executives and board members where relevant.
   ${isPublic ? '- For PUBLIC companies: consult the most recent DEF 14A proxy filing (available on SEC EDGAR) for the most complete list of executives and board members.' : ''}
   ${isPrivate ? '- For PRIVATE companies: note that full leadership disclosure may not be publicly available; direct readers to the company\'s official website for the most current team page.' : ''}

10. Data Gaps & Limitations — Explicitly list any areas where reliable data was not available. Categorise each gap by type:
    - [STRUCTURAL] — Unavailable by nature (e.g., private company, no public filings)
    - [TIMING] — Not yet reported (e.g., annual report not yet filed)
    - [PROPRIETARY] — Exists but not publicly disclosed
    - [NOT FOUND] — May exist but was not located during research

OUTPUT FORMAT:
- Use clear Markdown headers for each section
- Use bullet points for lists; use tables for comparative data where appropriate
- Keep language precise and professional
- Quantitative data must include source context (e.g., "per Q3 2024 earnings call")
- Tag all assumptions: [ASSUMPTION]
- Tag all missing data: [DATA UNAVAILABLE]

GUARDRAILS:
- Prioritise sources in this order: (1) SEC filings and official company press releases, (2) verified financial news outlets (Reuters, Bloomberg, WSJ, Financial Times), (3) third-party research aggregators
- Do not invent, interpolate, or round up figures without explicit labelling
- Do not use data older than 24 months unless it provides essential historical context — label it [HISTORICAL]
- Do not present opinion as fact
- Do not reproduce proprietary, paywalled, or confidential data
- For private companies: do not attempt to estimate revenue, EBITDA, or net income without a confirmed public source
---`;
  }

  // User research prompt
  return `---
USER RESEARCH PROMPT — CLIENT & STAKEHOLDER ANALYSIS
Generated: ${today}
---

ROLE:
You are a senior UX researcher and B2B customer intelligence analyst with expertise in client segmentation, buyer behaviour, service experience analysis, jobs-to-be-done frameworks, and voice-of-customer research.

GOAL:
Conduct a comprehensive, structured user research report on ${companyRef} — focused on who uses the company's services, why they choose it, how they experience the service, and what unmet needs, pain points, or information gaps exist. Draw on publicly available sources: client surveys, case studies, industry research, review platforms, analyst commentary, and the company's own published research. Be analytical and actionable.

${companyTypeNote}${focusNote}${customNote}

INSTRUCTIONS:

1. Client Segmentation — Identify and describe the company's primary client types across its business segments. For each: who the client is, what they buy, and at what scale.

2. User Personas — Construct 3–5 representative user personas from publicly available information. Each persona must include: role/title, organisation type, primary goals, key decisions, and how they engage with the company. Label all constructed personas [ASSUMPTION] where not directly sourced.

3. Jobs-to-Be-Done — For each major client type, describe the core job they are hiring the company to perform. Distinguish functional, emotional, and social jobs where evidence supports it.

4. Pain Points & Unmet Needs — Identify documented friction points, complaints, and unmet needs across each client type. Draw on: review platforms, industry surveys, analyst reports, published case studies, and client quotes. Label sources clearly.

   NEGOTIATION DYNAMICS & INFORMATION ASYMMETRY (mandatory sub-section):
   For each client type, explicitly probe for structural imbalances in how information flows between parties at the moment a deal, contract, or transaction is made:
   - What does one party (e.g., landlord, seller, service provider) know that the other (e.g., tenant, buyer, client) does not at the point of decision?
   - Does the broker, advisor, or intermediary have a structural conflict of interest that prevents them from surfacing this information to the client?
   - What leverage does the client possess that they may be systematically unaware of or unable to act on — and why?
   - Are there market dynamics (e.g., vacancy pressure, supplier margins, pricing floors, counterparty desperation) that are visible to one side but opaque to the other?

   These dynamics are frequently absent from public surveys. They exist as practitioner and tacit knowledge. Where they cannot be confirmed through public sources, label as [ASSUMPTION — practitioner inference] and explicitly note that primary research (expert interviews, practitioner sessions) is required to validate.

5. Client Satisfaction & Reputation Signals — Report any publicly available NPS scores, satisfaction ratings, award recognitions, or third-party quality rankings. Note source and date.

6. Customer Journey & Key Touchpoints — Map the typical client journey for the company's core service line: awareness → consideration → selection → onboarding → steady-state delivery → renewal or exit. Identify key friction points at each stage. Label inferred stages [ASSUMPTION].

7. Competitive Preference Drivers — What factors lead clients to choose this company over competitors, and what factors lead them to choose a competitor instead? Include any publicly available switching behaviour data or survey-based preference research.

8. Emerging Client Needs & Trends — Identify evolving client demands in the last 24 months: technology expectations, regulatory shifts, market structure changes, or documented shifts in what clients are asking for.

9. Geographic & Sector Variations — Note documented differences in client behaviour, needs, or satisfaction across key geographies or service sectors.

10. Data Gaps & Limitations — Explicitly list areas where reliable data was unavailable. Categorise each gap by type:
    - [STRUCTURAL] — Unavailable by nature (e.g., proprietary NPS, private client data)
    - [TIMING] — Not yet published
    - [PROPRIETARY] — Exists but not publicly disclosed
    - [NOT FOUND] — May exist but not located during research

    Additionally, flag which pain points and asymmetry dynamics identified in Section 4 require primary research (interviews, expert sessions) to validate.

OUTPUT FORMAT:
- Use clear Markdown headers for each section
- Use bullet points for lists; persona cards and tables for structured data
- Keep language precise and professional
- All direct quotes or review excerpts must include source and date
- Tag all assumptions: [ASSUMPTION] or [ASSUMPTION — practitioner inference]
- Tag all missing data: [DATA UNAVAILABLE]

GUARDRAILS:
- Prioritise sources: (1) company's own published research and case studies, (2) verified industry surveys and analyst reports, (3) professional review platforms and media, (4) third-party aggregators
- Do not fabricate client quotes, NPS scores, or satisfaction ratings
- Do not restrict pain point research to publicly documented complaints — actively probe for structural, systemic, and information-asymmetry pain points that practitioners know but rarely appear in published sources
- Do not present inferred personas as confirmed facts — label all constructed personas
- Do not use data older than 24 months unless providing essential context, labelled [HISTORICAL]
---`;
}
