// Default site document. The pillar/story taxonomy is DATA — not hard-coded
// into rendering — so it can change later without code edits.

export const SITE_VERSION = 1;

export const PILLARS = [
  {
    id: 'p-capable',
    name: 'Stay Capable, Longer',
    stories: [
      { id: 'p-capable-s1', name: 'Stay capable for the long run' },
      { id: 'p-capable-s2', name: 'Protect the body that carries you' },
      { id: 'p-capable-s3', name: 'Keep doing what matters' },
      { id: 'p-capable-s4', name: 'Sustainable, not just for now' },
    ],
  },
  {
    id: 'p-works',
    name: 'Built to Actually Work',
    stories: [
      { id: 'p-works-s1', name: 'Chosen for efficacy, not marketing' },
      { id: 'p-works-s2', name: 'Combination of ingredients' },
      { id: 'p-works-s3', name: 'Source determines quality' },
      { id: 'p-works-s4', name: 'Beyond the label' },
      { id: 'p-works-s5', name: 'Foundations before trends' },
    ],
  },
  {
    id: 'p-peace',
    name: 'Peace of Mind',
    stories: [
      { id: 'p-peace-s1', name: 'We read what labels leave out' },
      { id: 'p-peace-s2', name: 'We chose what we would take ourselves' },
      { id: 'p-peace-s3', name: "We verified what most people can't verify, so you don't have to second-guess it" },
    ],
  },
  {
    id: 'p-founder',
    name: 'Founder Credibility',
    stories: [
      { id: 'p-founder-s1', name: 'Standards before scale' },
      { id: 'p-founder-s2', name: '20+ years in raw materials' },
      { id: 'p-founder-s3', name: 'Built with care, research, and patience' },
      { id: 'p-founder-s4', name: "We tell you what helps, even when we don't sell it" },
    ],
  },
];

// Eight empty chapters with sensible default layouts (alternating). `template` is
// always an image layout; `showImage` is the separate text-only gate. Copy is
// intentionally blank — clients fill it via the CMS.
const LAYOUTS = ['image-right', 'image-left', 'image-full', 'image-right', 'image-right', 'image-left', 'image-below', 'image-full'];
const TEXT_ONLY = new Set([3, 7]); // chapters that start without an image

function emptyChapter(i) {
  return {
    id: `c${i + 1}`,
    template: LAYOUTS[i],
    imageWidth: i % 2 === 0 ? 'two-thirds' : 'half',
    eyebrow: '',
    title: '',
    body: '',
    showImage: !TEXT_ONLY.has(i),
    showFrame: false,
    motif: 'abstract',      // default placeholder preset
    sketch: null,           // freehand drawing: { strokes: [[[x,y],...], ...] }
    caption: '',
    primaryCta: '',
    secondaryCta: '',
    storyIds: [],           // selected brand-message story ids (may span pillars)
    titleHistory: [],
    bodyHistory: [],
  };
}

export function makeSeed() {
  return {
    version: SITE_VERSION,
    pillars: PILLARS,
    chapters: Array.from({ length: 8 }, (_, i) => emptyChapter(i)),
  };
}
