// =============================================================================
// Core data types for LegisTrack
// =============================================================================

export type BillStatus =
  | 'Introduced'
  | 'In Committee'
  | 'Passed House'
  | 'Passed Senate'
  | 'Passed Both'
  | 'Signed into Law'
  | 'Vetoed'
  | 'Failed';

export type Chamber = 'House' | 'Senate' | 'Joint';

export type ImpactLevel = 'Critical' | 'High' | 'Medium' | 'Low';

export type Sector =
  | 'Telecom'
  | 'Broadband'
  | 'Energy'
  | 'Water'
  | 'Transportation'
  | 'Infrastructure'
  | 'Utilities'
  | 'Nuclear'
  | 'Cybersecurity'
  | 'Finance'
  | 'Tax';

export type Category =
  | 'Telecom'
  | 'Energy'
  | 'Water'
  | 'Transportation'
  | 'Infrastructure';

export interface Bill {
  id: string;
  title: string;
  shortTitle: string;
  chamber: Chamber;
  billNumber: string;
  status: BillStatus;
  introduced: string;       // ISO date
  lastAction: string;
  lastActionDate: string;   // ISO date
  category: Category;
  sectors: Sector[];
  summary: string;
  sponsors: string[];
  cosponsors: number;
  committees: string[];
  impactLevel: ImpactLevel;
  congress: string;
  sourceUrl: string;
  tags: string[];
  // Optional enrichment fields from APIs
  fullText?: string;
  actions?: BillAction[];
  relatedBills?: string[];
}

export interface BillAction {
  date: string;
  description: string;
  chamber?: Chamber;
}

// =============================================================================
// API response types — Congress.gov
// =============================================================================

export interface CongressGovBillResult {
  bill: {
    number: string;
    title: string;
    type: string;
    originChamber: string;
    introducedDate: string;
    latestAction: {
      actionDate: string;
      text: string;
    };
    policyArea?: { name: string };
    subjects?: { legislativeSubjects: { name: string }[] };
    sponsors?: { item: { fullName: string; party: string; state: string }[] };
    cosponsors?: { count: number };
    committees?: { item: { name: string }[] };
    congress: number;
    url: string;
  };
}

export interface CongressGovSearchResponse {
  bills: CongressGovBillResult['bill'][];
  pagination: {
    count: number;
    next?: string;
  };
}

// =============================================================================
// API response types — LegiScan
// =============================================================================

export interface LegiScanBillResult {
  bill_id: number;
  bill_number: string;
  title: string;
  description: string;
  state: string;
  session: { session_id: number; session_name: string };
  status: number;
  status_date: string;
  last_action: string;
  last_action_date: string;
  url: string;
  change_hash: string;
  subjects: { subject_id: number; subject_name: string }[];
  history: { date: string; action: string; chamber: string }[];
  sponsors: { people_id: number; name: string; party: string }[];
  committee: { committee_id: number; name: string }[];
}

export interface LegiScanSearchResponse {
  searchresult: {
    [key: string]: LegiScanBillResult | { total: number; page: number; count: number };
  };
}

// =============================================================================
// App state types
// =============================================================================

export interface Filters {
  search: string;
  categories: Category[];
  sectors: Sector[];
  statuses: BillStatus[];
  chambers: Chamber[];
  impactLevels: ImpactLevel[];
  sortBy: 'lastAction' | 'introduced' | 'impact' | 'title';
  sortDir: 'asc' | 'desc';
}

export interface AppState {
  bills: Bill[];
  filters: Filters;
  loading: boolean;
  error: string | null;
  lastUpdated: string | null;
  selectedBill: Bill | null;
}

export const DEFAULT_FILTERS: Filters = {
  search: '',
  categories: [],
  sectors: [],
  statuses: [],
  chambers: [],
  impactLevels: [],
  sortBy: 'lastAction',
  sortDir: 'desc',
};
