import { z } from "zod";

export const loginSchema = z.object({
  email: z.email({ error: "Please enter a valid email." }).trim(),
  password: z.string().min(1, { error: "Password is required." }),
});

export const signupSchema = z.object({
  name: z.string().min(2, { error: "Name must be at least 2 characters." }).trim(),
  email: z.email({ error: "Please enter a valid email." }).trim(),
  password: z
    .string()
    .min(8, { error: "Password must be at least 8 characters." })
    .regex(/[a-zA-Z]/, { error: "Password must contain a letter." })
    .regex(/[0-9]/, { error: "Password must contain a number." }),
});

export const roadmapSchema = z.object({
  title: z.string().min(2, { error: "Title must be at least 2 characters." }).trim(),
  slug: z
    .string()
    .min(2, { error: "Slug must be at least 2 characters." })
    .regex(/^[a-z0-9-]+$/, {
      error: "Slug can only contain lowercase letters, numbers, and hyphens.",
    }),
  description: z.string().trim().optional(),
});

export const roadmapNodeSchema = z.object({
  title: z.string().min(2, { error: "Title must be at least 2 characters." }).trim(),
  description: z.string().trim().optional(),
  resourceUrl: z.url({ error: "Must be a valid URL." }).optional().or(z.literal("")),
  positionX: z.coerce.number().default(0),
  positionY: z.coerce.number().default(0),
});
