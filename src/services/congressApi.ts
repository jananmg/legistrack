import type { Bill } from '../types';
import { classifyBill } from '../utils/classifier';

const API_KEY = import.meta.env.VITE_CONGRESS_API_KEY;

// Call Congress.gov directly (supports CORS)
const BASE_URL = 'https://api.congress.gov/v3';

const SEARCH_QUERIES = [
  'infrastructure',
  'telecommunications',
  'broadband',
  'electric utility',
  'water infrastructure',
  'energy grid',
  'spectrum',
  'pipeline safety',
  'nuclear energy',
  'smart grid',
  'power utility',
  'electric power',
  'FERC',
  'power generation',
  'transmission line',
  'grid reliability',
  'grid modernization',
  'net metering',
  'utility regulation',
  'clean water act',
  'safe drinking water',
];

async function fetchJSON(url: string): Promise<any> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Congress.gov API error: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

export async function searchBills(congress: number = 119): Promise<Bill[]> {
  if (!API_KEY) {
    throw new Error('Congress.gov API key not configured.');
  }

  const seen = new Set<string>();
  const allBills: Bill[] = [];

  for (const query of SEARCH_QUERIES) {
    try {
      const url = `${BASE_URL}/bill?query=${encodeURIComponent(query)}&congress=${congress}&limit=20&sort=updateDate+desc&api_key=${API_KEY}&format=json`;
      const data = await fetchJSON(url);
      const bills = data.bills || [];

      for (const raw of bills) {
        const billType = raw.type || 'HR';
        const key = `${billType}${raw.number}-${raw.congress}`;
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

function mapCongressBill(raw: any): Bill | null {
  if (!raw) return null;
  if (raw.congress && raw.congress !== 119) return null;

  const title = raw.title || '';
  const policyArea = raw.policyArea?.name || '';
  const subjects = raw.subjects?.legislativeSubjects || [];
  const classification = classifyBill(title, policyArea, subjects);
  if (!classification) return null;

  const billType = raw.type || 'HR';
  const chamberMap: Record<string, 'House' | 'Senate'> = {
    HR: 'House', HRES: 'House', HJRES: 'House', HCONRES: 'House',
    S: 'Senate', SRES: 'Senate', SJRES: 'Senate', SCONRES: 'Senate',
  };

  return {
    id: `${billType}-${raw.number}`,
    title,
    shortTitle: title.length > 60 ? title.slice(0, 59) + '…' : title,
    chamber: chamberMap[billType] || 'House',
    billNumber: formatBillNumber(billType, raw.number),
    status: inferStatus(raw.latestAction?.text),
    introduced: raw.introducedDate || '',
    lastAction: raw.latestAction?.text || '',
    lastActionDate: raw.latestAction?.actionDate || '',
    category: classification.category,
    sectors: classification.sectors,
    summary: title,
    sponsors: raw.sponsors?.map((s: any) => `${s.fullName} (${s.party}-${s.state})`) || [],
    cosponsors: raw.cosponsors?.count || 0,
    committees: raw.committees?.map((c: any) => c.name) || [],
    impactLevel: classification.impact,
    congress: `${raw.congress || 119}th`,
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