import { z } from "zod";
import { TEMPLATE_IDS } from "./templates";
import type { TemplateId } from "./types";

export const credentialsSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email").max(200),
  password: z.string().min(8, "Password must be at least 8 characters").max(200),
});

export const designSchema = z.object({
  template: z.enum(TEMPLATE_IDS as [TemplateId, ...TemplateId[]]),
  color: z.string().regex(/^#[0-9a-f]{6}$/i, "Invalid colour"),
  customText: z.string().trim().max(40, "Custom text is at most 40 characters"),
});

export const tagSchema = z.object({
  itemName: z.string().trim().min(1, "Item name is required").max(60, "Item name is at most 60 characters"),
  note: z
    .string()
    .trim()
    .max(200, "Note is at most 200 characters")
    .transform((v) => (v === "" ? null : v)),
  design: designSchema,
});

export const statusSchema = z.enum(["safe", "lost", "found"]);

const body = z.string().trim().min(1, "Message cannot be empty").max(1000, "Message is at most 1000 characters");

/** Hidden "website" field: humans never see it, bots tend to fill it in. */
const honeypot = z.string().max(0, "Spam detected").optional();

export const finderMessageSchema = z
  .object({
    code: z.string().trim().toUpperCase(),
    body,
    website: honeypot,
    lat: z.number().min(-90).max(90).nullable().optional(),
    lng: z.number().min(-180).max(180).nullable().optional(),
  })
  .refine((v) => (v.lat == null) === (v.lng == null), { message: "Location needs both coordinates" });

export const finderReplySchema = z.object({ token: z.string().min(20).max(64), body, website: honeypot });

export const ownerReplySchema = z.object({ conversationId: z.string().uuid(), body });

export const firstError = (e: z.ZodError) => e.issues[0]?.message ?? "Invalid input";
