export const PRODUCT_TYPES = [
  "mobile app",
  "desktop app",
  "SaaS",
  "AI tool",
  "browser extension",
  "API",
  "CLI tool",
  "Chrome extension",
  "portfolio platform",
  "marketplace",
  "automation tool",
  "dashboard",
  "CRM",
  "CMS",
  "analytics platform",
] as const;

export const NICHES = [
  "tattoo artists",
  "restaurants",
  "gyms",
  "freelancers",
  "photographers",
  "lawyers",
  "dentists",
  "teachers",
  "students",
  "developers",
  "startups",
  "content creators",
  "musicians",
  "therapists",
  "real estate agents",
  "event organizers",
  "mechanics",
  "coffee shops",
  "nonprofits",
  "pet owners",
] as const;

export const DIFFERENTIATORS = [
  "using AI",
  "with offline support",
  "focused on accessibility",
  "for local businesses",
  "with automation workflows",
  "with gamification",
  "powered by voice commands",
  "with AI-powered appointment management",
  "with one-click invoicing",
  "with instant WhatsApp notifications",
  "with marketplace integrations",
  "built on a subscription model",
] as const;

export type Idea = {
  id: number;
  product: string;
  niche: string;
  differentiator: string | null;
};

const pick = <T,>(arr: readonly T[], exclude?: T): T => {
  if (arr.length <= 1) return arr[0];
  let next = arr[Math.floor(Math.random() * arr.length)];
  while (next === exclude) next = arr[Math.floor(Math.random() * arr.length)];
  return next;
};

export const generateIdea = (prev: Idea | null): Idea => ({
  id: Date.now() + Math.floor(Math.random() * 1000),
  product: pick(PRODUCT_TYPES, prev?.product),
  niche: pick(NICHES, prev?.niche),
  differentiator:
    Math.random() < 0.7
      ? pick(DIFFERENTIATORS, prev?.differentiator ?? undefined)
      : null,
});

export const formatIdea = (idea: Idea): string => {
  const base = `Build a ${idea.product} for ${idea.niche}`;
  return idea.differentiator ? `${base} - ${idea.differentiator}` : base;
};
