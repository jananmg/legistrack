// =============================================================================
// Congress.gov API Service
// Docs: https://api.congress.gov/
// Free API key: https://api.congress.gov/sign-up/
// =============================================================================

import type { Bill, CongressGovSearchResponse, BillAction } from '../types';
import { classifyBill } from '../utils/classifier';

const API_KEY = import.meta.env.VITE_CONGRESS_API_KEY;
const BASE_URL = '/api/congress/v3';

// Infrastructure / utilities / telecom policy areas and subjects to search
const SEARCH_QUERIES = [
  'infrastructure',
  'telecommunications',
  'broadband',
  'electric utility',
  'water infrastructure',
  'energy grid',
  'spectrum',
  'pipeline',
  'transportation infrastructure',
  'nuclear energy',
  'clean water',
  'rural broadband',
  'smart grid',
  '5G',
  // Power utilities
  'power utility',
  'electric power',
  'electricity rate',
  'public utility commission',
  'FERC',
  'power generation',
  'transmission line',
  'electric cooperative',
  'grid reliability',
  'load interconnection',
  'net metering',
  'distributed generation',
  'utility regulation',
  'power outage',
  'grid modernization',
  'electricity market',
];

async function fetchFromCongress(endpoint: string, params: Record<string, string> = {}): Promise<any> {
  if (!API_KEY) {
    throw new Error('Congress.gov API key not configured. Add VITE_CONGRESS_API_KEY to your .env file.');
  }

  const url = new URL(`${BASE_URL}${endpoint}`, window.location.origin);
  url.searchParams.set('api_key', API_KEY);
  url.searchParams.set('format', 'json');
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));

  const res = await fetch(url.toString());
  if (!res.ok) {
    throw new Error(`Congress.gov API error: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

/**
 * Search Congress.gov for bills matching infrastructure/utilities keywords.
 * Deduplicates results across multiple queries.
 */
export async function searchBills(congress: number = 119): Promise<Bill[]> {
  const seen = new Set<string>();
  const allBills: Bill[] = [];

  for (const query of SEARCH_QUERIES) {
    try {
      const data: CongressGovSearchResponse = await fetchFromCongress('/bill', {
        query,
        congress: String(congress),
        limit: '20',
        sort: 'updateDate+desc',
      });

      if (!data.bills) continue;

      for (const raw of data.bills) {
        const key = `${raw.type}${raw.number}-${raw.congress}`;
        if (seen.has(key)) continue;
        seen.add(key);

        const bill = mapCongressBill(raw);
        if (bill) allBills.push(bill);
      }
    } catch (err) {
      console.warn(`Congress.gov search failed for "${query}":`, err);
    }
  }

  return allBills;
}

/**
 * Fetch full details for a single bill.
 */
export async function getBillDetails(congress: number, type: string, number: number): Promise<Bill | null> {
  try {
    const data = await fetchFromCongress(`/bill/${congress}/${type.toLowerCase()}/${number}`);
    return mapCongressBill(data.bill);
  } catch (err) {
    console.error('Failed to fetch bill details:', err);
    return null;
  }
}

/**
 * Fetch action history for a bill.
 */
export async function getBillActions(congress: number, type: string, number: number): Promise<BillAction[]> {
  try {
    const data = await fetchFromCongress(`/bill/${congress}/${type.toLowerCase()}/${number}/actions`);
    return (data.actions || []).map((a: any) => ({
      date: a.actionDate,
      description: a.text,
      chamber: a.actionCode?.startsWith('H') ? 'House' : a.actionCode?.startsWith('S') ? 'Senate' : undefined,
    }));
  } catch {
    return [];
  }
}

// Map raw Congress.gov response to our Bill type
function mapCongressBill(raw: any): Bill | null {
  if (!raw) return null;

  const classification = classifyBill(raw.title, raw.policyArea?.name, raw.subjects);

  // Skip bills that don't match our sectors
  if (!classification) return null;

  const billType = raw.type || 'HR';
  const chamberMap: Record<string, 'House' | 'Senate'> = {
    HR: 'House', HRES: 'House', HJRES: 'House', HCONRES: 'House',
    S: 'Senate', SRES: 'Senate', SJRES: 'Senate', SCONRES: 'Senate',
  };

  return {
    id: `${billType}-${raw.number}`,
    title: raw.title || 'Untitled Bill',
    shortTitle: truncate(raw.title || '', 60),
    chamber: chamberMap[billType] || 'House',
    billNumber: formatBillNumber(billType, raw.number),
    status: inferStatus(raw.latestAction?.text),
    introduced: raw.introducedDate || '',
    lastAction: raw.latestAction?.text || '',
    lastActionDate: raw.latestAction?.actionDate || '',
    category: classification.category,
    sectors: classification.sectors,
    summary: raw.title || '',
    sponsors: raw.sponsors?.map((s: any) => `${s.fullName} (${s.party}-${s.state})`) || [],
    cosponsors: raw.cosponsors?.count || 0,
    committees: raw.committees?.map((c: any) => c.name) || [],
    impactLevel: classification.impact,
    congress: `${raw.congress}th`,
    sourceUrl: raw.url || `https://www.congress.gov/bill/${raw.congress}th-congress/${billType.toLowerCase()}/${raw.number}`,
    tags: classification.tags,
  };
}

function inferStatus(action?: string): Bill['status'] {
  if (!action) return 'Introduced';
  const a = action.toLowerCase();
  if (a.includes('became public law') || a.includes('signed by president')) return 'Signed into Law';
  if (a.includes('passed senate') && a.includes('passed house')) return 'Passed Both';
  if (a.includes('passed house') || a.includes('passed the house')) return 'Passed House';
  if (a.includes('passed senate') || a.includes('passed the senate')) return 'Passed Senate';
  if (a.includes('vetoed')) return 'Vetoed';
  if (a.includes('failed') || a.includes('laid on table')) return 'Failed';
  if (a.includes('committee') || a.includes('subcommittee')) return 'In Committee';
  return 'Introduced';
}

function formatBillNumber(type: string, num: number | string): string {
  const prefixMap: Record<string, string> = {
    HR: 'H.R.', S: 'S.', HJRES: 'H.J.Res.', SJRES: 'S.J.Res.',
    HRES: 'H.Res.', SRES: 'S.Res.', HCONRES: 'H.Con.Res.', SCONRES: 'S.Con.Res.',
  };
  return `${prefixMap[type] || type} ${num}`;
}

function truncate(str: string, max: number): string {
  return str.length > max ? str.slice(0, max - 1) + '…' : str;
}
