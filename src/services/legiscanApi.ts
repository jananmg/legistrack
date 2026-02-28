// =============================================================================
// LegiScan API Service
// Docs: https://legiscan.com/legiscan
// Free tier: 30,000 API calls per month
// =============================================================================

import type { Bill, LegiScanSearchResponse } from '../types';
import { classifyBill } from '../utils/classifier';

const API_KEY = import.meta.env.VITE_LEGISCAN_API_KEY;
const BASE_URL = '/api/legiscan';

const SEARCH_QUERIES = [
  'infrastructure investment',
  'telecommunications',
  'broadband deployment',
  'electric grid',
  'water utility',
  'energy infrastructure',
  'pipeline safety',
  'spectrum allocation',
  'renewable energy grid',
  'smart grid',
  // Power utilities
  'electric power utility',
  'power generation',
  'electricity rate',
  'public utility commission',
  'FERC regulation',
  'grid reliability',
  'transmission capacity',
  'electric cooperative',
  'net metering',
  'grid modernization',
  'utility deregulation',
];

async function fetchFromLegiScan(params: Record<string, string>): Promise<any> {
  if (!API_KEY) {
    throw new Error('LegiScan API key not configured. Add VITE_LEGISCAN_API_KEY to your .env file.');
  }

  const url = new URL(BASE_URL, window.location.origin);
  url.searchParams.set('key', API_KEY);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));

  const res = await fetch(url.toString());
  if (!res.ok) {
    throw new Error(`LegiScan API error: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

/**
 * Search LegiScan for federal infrastructure/utility bills.
 */
export async function searchBills(): Promise<Bill[]> {
  const seen = new Set<number>();
  const allBills: Bill[] = [];

  for (const query of SEARCH_QUERIES) {
    try {
      const data: LegiScanSearchResponse = await fetchFromLegiScan({
        op: 'search',
        state: 'US',          // Federal bills only
        query,
        year: '2',            // Current session
      });

      const results = data.searchresult;
      if (!results) continue;

      for (const [key, val] of Object.entries(results)) {
        if (key === 'summary' || typeof val !== 'object' || !('bill_id' in val)) continue;
        const raw = val as any;

        if (seen.has(raw.bill_id)) continue;
        seen.add(raw.bill_id);

        const bill = mapLegiScanBill(raw);
        if (bill) allBills.push(bill);
      }
    } catch (err) {
      console.warn(`LegiScan search failed for "${query}":`, err);
    }
  }

  return allBills;
}

/**
 * Fetch full bill details from LegiScan by bill_id.
 */
export async function getBillDetails(billId: number): Promise<Bill | null> {
  try {
    const data = await fetchFromLegiScan({ op: 'getBill', id: String(billId) });
    return mapLegiScanBill(data.bill);
  } catch (err) {
    console.error('LegiScan getBill failed:', err);
    return null;
  }
}

/**
 * Get recent changes/updates to monitored bills.
 */
export async function getRecentChanges(): Promise<any[]> {
  try {
    const data = await fetchFromLegiScan({ op: 'getSearchRaw', state: 'US', query: 'infrastructure', year: '2' });
    return data?.searchresult ? Object.values(data.searchresult) : [];
  } catch {
    return [];
  }
}

// Map LegiScan response to our Bill type
function mapLegiScanBill(raw: any): Bill | null {
  if (!raw) return null;

  const classification = classifyBill(raw.title || raw.description, '', []);
  if (!classification) return null;

  const statusMap: Record<number, Bill['status']> = {
    1: 'Introduced',
    2: 'In Committee',
    3: 'In Committee',
    4: 'Passed House',
    5: 'Passed Senate',
    6: 'Signed into Law',
  };

  const chamber = raw.bill_number?.startsWith('S') ? 'Senate' : 'House';

  return {
    id: `LS-${raw.bill_id}`,
    title: raw.title || raw.description || 'Untitled',
    shortTitle: truncate(raw.title || raw.description || '', 60),
    chamber: chamber as Bill['chamber'],
    billNumber: raw.bill_number || '',
    status: statusMap[raw.status] || 'Introduced',
    introduced: raw.status_date || '',
    lastAction: raw.last_action || '',
    lastActionDate: raw.last_action_date || '',
    category: classification.category,
    sectors: classification.sectors,
    summary: raw.description || raw.title || '',
    sponsors: raw.sponsors?.map((s: any) => `${s.name} (${s.party})`) || [],
    cosponsors: (raw.sponsors?.length || 1) - 1,
    committees: raw.committee?.map((c: any) => c.name) || [],
    impactLevel: classification.impact,
    congress: '119th',
    sourceUrl: raw.url || '',
    tags: classification.tags,
  };
}

function truncate(str: string, max: number): string {
  return str.length > max ? str.slice(0, max - 1) + '…' : str;
}
