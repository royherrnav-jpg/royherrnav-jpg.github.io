// Everything personal about the site lives here. Edit freely.

export const SITE = {
  name: 'Roy Herrera',
  description: 'Physics PhD student in quantum optics and quantum information. Photographs and writing.',
  // Shown large on the homepage.
  bio: "I'm a first-year physics PhD student working in quantum optics and quantum information. I also take photographs and write about both.",
  // Links shown under the bio and on the About page. Leave href empty to hide one.
  links: [
    { label: 'email', href: '' }, // e.g. 'mailto:you@example.com'
    { label: 'github', href: '' }, // e.g. 'https://github.com/yourname'
    { label: 'instagram', href: '' },
  ],
};

export const NAV = [
  { label: 'research', href: '/research/' },
  { label: 'photographs', href: '/photographs/' },
  { label: 'writing', href: '/writing/' },
  { label: 'recommendations', href: '/recommendations/' },
  { label: 'about', href: '/about/' },
];

// Every post has a `kind`. Each kind gets its own page at /writing/<kind>/.
export const WRITING_KINDS = {
  essays: { label: 'Essays', singular: 'Essay', description: 'Longer pieces.' },
  thoughts: { label: 'Thoughts', singular: 'Thought', description: 'Shorter notes and passing thoughts.' },
  poems: { label: 'Poems', singular: 'Poem', description: '' },
} as const;

export type WritingKind = keyof typeof WRITING_KINDS;

export const postUrl = (post: { id: string; data: { kind: WritingKind } }) =>
  `/writing/${post.data.kind}/${post.id}/`;

export type Publication = {
  title: string;
  authors: string;
  venue: string;
  year: number;
  href?: string;
};

// Where your published papers are listed (Google Scholar, ORCID, arXiv, INSPIRE…).
// Shown on the Research page and the homepage. Leave href empty to hide it.
export const PAPERS = {
  label: 'Google Scholar',
  href: 'https://scholar.google.com/citations?user=1b8V3REAAAAJ&hl=en',
};

// Listed on the Research page. The section stays hidden while this is empty.
export const PUBLICATIONS: Publication[] = [
  // { title: 'Paper title', authors: 'R. Herrera, A. Advisor', venue: 'arXiv:2609.01234', year: 2026, href: 'https://arxiv.org/abs/2609.01234' },
];

export const monthStamp = (d: Date) =>
  `${d.getUTCFullYear()}·${String(d.getUTCMonth() + 1).padStart(2, '0')}`;

export const longDate = (d: Date) =>
  d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });

export const shortDate = (d: Date) =>
  d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

// "March 3, 2026" · "March 3–5, 2026" · "March 3 – August 8, 2026"
export const dateRange = (start: Date, end: Date = start) => {
  const [y1, m1, d1] = [start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate()];
  const [y2, m2, d2] = [end.getUTCFullYear(), end.getUTCMonth(), end.getUTCDate()];
  if (y1 !== y2) return `${longDate(start)} – ${longDate(end)}`;
  if (m1 !== m2) return `${MONTHS[m1]} ${d1} – ${MONTHS[m2]} ${d2}, ${y1}`;
  if (d1 !== d2) return `${MONTHS[m1]} ${d1}–${d2}, ${y1}`;
  return longDate(start);
};

// Photo times are camera wall-clock with no timezone. Treating them as UTC and
// formatting in UTC shows them exactly as the camera recorded them.
export const takenDate = (taken: string) => new Date(`${taken}Z`);
export const clockTime = (d: Date) => d.toISOString().slice(11, 16);

export const exposureParts = (p: { focalLength?: number; aperture?: number; shutter?: string; iso?: number }) =>
  [
    p.focalLength && `${p.focalLength}mm`,
    p.aperture && `f/${p.aperture}`,
    p.shutter && `${p.shutter}s`,
    p.iso && `ISO ${p.iso}`,
  ].filter(Boolean) as string[];
