import type { Bill } from '../types';
import * as congress from './congressApi';
import * as legiscan from './legiscanApi';
import { SEED_BILLS } from './seedData';

const CONGRESS_KEY = import.meta.env.VITE_CONGRESS_API_KEY;
const LEGISCAN_KEY = import.meta.env.VITE_LEGISCAN_API_KEY;

export interface FetchResult {
  bills: Bill[];
  sources: string[];
  errors: string[];
  timestamp: string;
}

export async function fetchAllBills(): Promise<FetchResult> {
  const sources: string[] = ['Curated Data'];
  const errors: string[] = [];
  let allBills: Bill[] = [...SEED_BILLS];

  if (CONGRESS_KEY) {
    try {
      const bills = await congress.searchBills(119);
      allBills.push(...bills);
      sources.push('Congress.gov');
    } catch (err: any) {
      errors.push(`Congress.gov: ${err.message}`);
    }
  }

  if (LEGISCAN_KEY) {
    try {
      const bills = await legiscan.searchBills();
      allBills.push(...bills);
      sources.push('LegiScan');
    } catch (err: any) {
      errors.push(`LegiScan: ${err.message}`);
    }
  }

  const deduped = deduplicateBills(allBills);

  return {
    bills: deduped,
    sources,
    errors,
    timestamp: new Date().toISOString(),
  };
}

function deduplicateBills(bills: Bill[]): Bill[] {
  const map = new Map<string, Bill>();
  for (const bill of bills) {
    const key = bill.billNumber.replace(/[\s.]+/g, '').toUpperCase();
    const existing = map.get(key);
    if (!existing) {
      map.set(key, bill);
    } else {
      map.set(key, {
        ...existing,
        summary: existing.summary.length >= bill.summary.length ? existing.summary : bill.summary,
        tags: [...new Set([...existing.tags, ...bill.tags])].slice(0, 8),
        sectors: [...new Set([...existing.sectors, ...bill.sectors])],
        sponsors: existing.sponsors.length >= bill.sponsors.length ? existing.sponsors : bill.sponsors,
        cosponsors: Math.max(existing.cosponsors, bill.cosponsors),
        committees: [...new Set([...existing.committees, ...bill.committees])],
      });
    }
  }
  return Array.from(map.values());
}