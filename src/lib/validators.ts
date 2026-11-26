import { z } from "zod";
import { INDUSTRIES, PRICING_MODELS } from "@/lib/constants";

const requiredUrl = z
  .string()
  .trim()
  .min(1, "Website URL is required.")
  .max(300)
  .refine((value) => {
    try {
      const url = new URL(value);
      return url.protocol === "http:" || url.protocol === "https:";
    } catch {
      return false;
    }
  }, "Enter a valid URL starting with http:// or https://.");

const optionalUrl = z
  .string()
  .trim()
  .max(300)
  .refine((value) => {
    if (!value) return true;
    try {
      const url = new URL(value);
      return url.protocol === "http:" || url.protocol === "https:";
    } catch {
      return false;
    }
  }, "Enter a valid URL starting with http:// or https://.");

export const signupSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters.").max(80, "Name must be 80 characters or fewer."),
  email: z.string().trim().email("Enter a valid email address.").max(160),
  password: z
    .string()
    .min(8, "Use at least 8 characters.")
    .max(72, "Password must be 72 characters or fewer."),
});

export const loginSchema = z.object({
  email: z.string().trim().email("Enter a valid email address."),
  password: z.string().min(1, "Enter your password.").max(72),
});

export const forgotSchema = z.object({
  email: z.string().trim().email("Enter a valid email address."),
});

export const resetSchema = z.object({
  token: z.string().trim().min(20, "This reset link is invalid."),
  password: z
    .string()
    .min(8, "Use at least 8 characters.")
    .max(72, "Password must be 72 characters or fewer."),
});

export const listingSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters.").max(80, "Name must be 80 characters or fewer."),
  websiteUrl: requiredUrl,
  shortDescription: z
    .string()
    .trim()
    .min(20, "Short description must be at least 20 characters.")
    .max(180, "Short description must be 180 characters or fewer."),
  fullDescription: z.string().trim().max(5000, "Description must be 5000 characters or fewer."),
  features: z.string().trim().max(2000, "Features must be 2000 characters or fewer."),
  products: z.string().trim().max(2000, "Products must be 2000 characters or fewer."),
  benefits: z.string().trim().max(2000, "Benefits must be 2000 characters or fewer."),
  region: z.string().trim().max(80, "Region must be 80 characters or fewer."),
  pricingDetails: z.string().trim().max(1000, "Pricing details must be 1000 characters or fewer."),
  industry: z
    .string()
    .trim()
    .refine((value) => value === "" || (INDUSTRIES as readonly string[]).includes(value), "Choose an industry."),
  tags: z.string().trim().max(200, "Tags must be 200 characters or fewer."),
  categoryId: z.string().trim(),
  businessType: z.string().trim().max(40, "Business type must be 40 characters or fewer."),
  pricingModel: z
    .string()
    .trim()
    .refine((value) => value === "" || (PRICING_MODELS as readonly string[]).includes(value), "Choose a pricing model."),
  contactEmail: z
    .string()
    .trim()
    .max(120)
    .refine(
      (value) => value === "" || z.string().email().safeParse(value).success,
      "Enter a valid contact email.",
    ),
  twitterUrl: optionalUrl,
  linkedinUrl: optionalUrl,
  productHuntUrl: optionalUrl,
  githubUrl: optionalUrl,
  demoVideoUrl: optionalUrl,
});

export const categorySchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters.").max(40, "Name must be 40 characters or fewer."),
  description: z
    .string()
    .trim()
    .min(10, "Add a short description.")
    .max(160, "Description must be 160 characters or fewer."),
});

export const reviewSchema = z.object({
  listingId: z.string().trim().min(1),
  rating: z.coerce.number().int().min(1, "Choose a rating from 1 to 5.").max(5),
  body: z.string().trim().min(10, "Write at least 10 characters.").max(1000, "Reviews must be 1000 characters or fewer."),
});

export const claimSchema = z.object({
  listingId: z.string().trim().min(1),
  message: z.string().trim().min(20, "Explain how you represent this business, in at least 20 characters.").max(1000),
});

export const reportSchema = z.object({
  listingId: z.string().trim().min(1),
  reviewId: z.string().trim().min(1),
  reason: z.string().trim().min(10, "Describe the problem in at least 10 characters.").max(500),
});

export type ListingInput = z.infer<typeof listingSchema>;
