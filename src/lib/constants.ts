export const BUSINESS_TYPES = ["AI Tool", "SaaS", "Software", "Startup", "Other"] as const;
export const PRICING_MODELS = ["Free", "Freemium", "Paid"] as const;
export const INDUSTRIES = [
  "Artificial Intelligence",
  "Marketing",
  "Sales",
  "Software",
  "Design",
  "Productivity",
  "Finance",
  "Analytics",
  "Customer Support",
  "Human Resources",
  "E-commerce",
  "Other",
] as const;
export const LISTING_STATUSES = ["pending", "approved", "rejected"] as const;

export type BusinessType = (typeof BUSINESS_TYPES)[number];
export type PricingModel = (typeof PRICING_MODELS)[number];
export type ListingStatus = (typeof LISTING_STATUSES)[number];

export const PAGE_SIZE = 12;
