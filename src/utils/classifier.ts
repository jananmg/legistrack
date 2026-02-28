import type { Category, Sector, ImpactLevel } from '../types';

interface Classification {
  category: Category;
  sectors: Sector[];
  impact: ImpactLevel;
  tags: string[];
}

// word-boundary matching to avoid false positives
const SECTOR_KEYWORDS: Record<Sector, string[]> = {
  Telecom: [
    'telecommunication', 'telecom', '\\b5g\\b', '\\b6g\\b', 'wireless network',
    'spectrum allocation', 'spectrum use', 'spectrum management',
    '\\bfcc\\b', 'communications act', 'cell tower', 'mobile network',
  ],
  Broadband: [
    'broadband', 'internet access', 'fiber optic', 'bead program',
    'digital equity', 'internet service', 'rural broadband',
    'digital divide', 'net neutrality', 'broadband deployment',
    'broadband grant', 'connectivity fund',
  ],
  Energy: [
    'energy policy', 'energy infrastructure', 'energy development',
    'electric utility', 'electric power', 'electric grid', 'electric generat',
    'power grid', 'smart grid', 'power plant', 'power generation',
    'renewable energy', 'solar energy', 'wind energy', 'wind power',
    'natural gas pipeline', '\\bferc\\b', 'federal energy regulatory',
    'energy storage', 'battery storage', 'transmission line',
    'energy efficiency', 'fossil fuel', 'clean energy',
    'grid reliability', 'grid modernization', 'grid resilience',
    'load interconnection', 'peak demand', 'demand response',
    'distributed generation', 'net metering',
    'wholesale electricity', 'electricity rate', 'electricity market',
    'electric cooperative', 'municipal utility', 'investor-owned utility',
    'transmission capacity', 'distribution system', 'substation',
    'power outage', 'blackout', 'service interruption',
    'interconnection queue', 'capacity market',
    'baseload', 'combined cycle', 'cogeneration',
    'hydropower', 'geothermal energy', 'biomass energy',
    'energy appropriation', 'department of energy',
  ],
  Nuclear: [
    'nuclear energy', 'nuclear power', 'nuclear regulatory',
    '\\bnrc\\b', 'nuclear reactor', 'nuclear waste', 'nuclear weapon',
    'uranium', 'spent fuel', 'nuclear fusion', 'advanced reactor',
    'nuclear stockpile', 'nuclear deterrent', 'nuclear moderniz',
  ],
  Water: [
    'water infrastructure', 'clean water act', 'safe drinking water',
    'wastewater treatment', 'water treatment plant', 'water system',
    'water utility', 'sewer system', 'stormwater',
    'water quality certification', 'water pollution control',
    'water supply', 'desalination', 'water resource',
    'army corps of engineers', 'bureau of reclamation',
    'flood control', 'dam safety', 'levee',
    'waterway', 'inland waterway',
  ],
  Transportation: [
    'transportation infrastructure', 'highway infrastructure',
    'bridge infrastructure', 'public transit', 'mass transit',
    'railroad safety', 'rail infrastructure', '\\bamtrak\\b',
    'aviation infrastructure', 'port infrastructure',
    'road safety', 'highway safety', 'traffic safety',
    'federal highway', '\\bfhwa\\b',
    'transportation and infrastructure committee',
    'safe streets',
  ],
  Infrastructure: [
    'infrastructure investment', 'infrastructure bank',
    'infrastructure expansion', 'infrastructure financing',
    'public works', 'federal building',
    'rights-of-way', 'right-of-way',
    'infrastructure act', '\\biija\\b',
    'build america', 'permitting reform',
  ],
  Utilities: [
    'public utility', 'utility regulation', 'utility rate',
    'rate class', 'ratepayer', 'utility executive',
    'service reliability', 'utility commission',
    '\\bpuc\\b', 'public service commission',
    'utility deregulation', 'rate base', 'rate case',
    'integrated resource plan', 'resource adequacy',
    'utility merger', 'utility holding company',
    'rural electric', 'tennessee valley authority', '\\btva\\b',
    'bonneville power', 'federal power act',
    '\\bpurpa\\b', 'utility restructuring',
  ],
  Cybersecurity: [
    'cybersecurity infrastructure', 'network security',
    'critical infrastructure protection', 'critical infrastructure security',
    'supply chain security', 'telecom security',
  ],
  Finance: [
    'infrastructure bank', 'infrastructure financing',
    '\\btifia\\b', 'infrastructure fund',
    'infrastructure loan', 'infrastructure bond',
  ],
  Tax: [
    'broadband grant tax', 'infrastructure tax credit',
    'energy tax credit',
  ],
};

const SECTOR_TO_CATEGORY: Record<Sector, Category> = {
  Telecom: 'Telecom', Broadband: 'Telecom',
  Energy: 'Energy', Nuclear: 'Energy', Utilities: 'Energy',
  Water: 'Water',
  Transportation: 'Transportation',
  Infrastructure: 'Infrastructure',
  Cybersecurity: 'Telecom',
  Finance: 'Infrastructure', Tax: 'Infrastructure',
};

const HIGH_IMPACT_SIGNALS = [
  'appropriation', 'authorization', 'reauthoriz', 'nationwide',
  'amend the', 'establish', 'billion', 'million',
  'reform', 'moderniz', 'comprehensive', 'investment act',
];

export function classifyBill(
  title: string,
  policyArea?: string,
  subjects?: any[]
): Classification | null {
  const text = [
    title, policyArea,
    ...(subjects?.map((s: any) => s.name || s.subject_name || s) || []),
  ].filter(Boolean).join(' ').toLowerCase();

  const matchedSectors: Sector[] = [];
  const matchedTags: string[] = [];

  for (const [sector, keywords] of Object.entries(SECTOR_KEYWORDS)) {
    for (const kw of keywords) {
      let matched = false;
      if (kw.includes('\\b') || kw.includes('.*')) {
        try { matched = new RegExp(kw, 'i').test(text); } catch { matched = text.includes(kw.toLowerCase()); }
      } else {
        matched = text.includes(kw.toLowerCase());
      }
      if (matched) {
        if (!matchedSectors.includes(sector as Sector)) matchedSectors.push(sector as Sector);
        const cleanTag = kw.replace(/\\b/g, '').replace(/\.\*/g, ' ').trim();
        if (cleanTag.length > 2 && !matchedTags.includes(cleanTag)) matchedTags.push(cleanTag);
        break;
      }
    }
  }

  if (matchedSectors.length === 0) return null;

  const category = SECTOR_TO_CATEGORY[matchedSectors[0]];

  let impact: ImpactLevel = 'Low';
  const highSignals = HIGH_IMPACT_SIGNALS.filter(s => text.includes(s));
  if (highSignals.length >= 3) impact = 'Critical';
  else if (highSignals.length >= 2) impact = 'High';
  else if (highSignals.length >= 1 || matchedSectors.length >= 2) impact = 'Medium';

  const tags = matchedTags.slice(0, 5).map(t =>
    t.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
  );

  return { category, sectors: matchedSectors, impact, tags };
}
