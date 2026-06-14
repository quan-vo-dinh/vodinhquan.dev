import { z } from "zod";

export const momentStatusSchema = z.enum(["draft", "published", "archived"]);
export const momentVisibilitySchema = z.enum(["public", "private"]);

const optionalTextSchema = z
  .union([z.string(), z.null(), z.undefined()])
  .transform((value) => {
    const trimmed = typeof value === "string" ? value.trim() : "";
    return trimmed.length > 0 ? trimmed : null;
  });

const optionalDateSchema = optionalTextSchema.pipe(
  z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .nullable()
);

const optionalSlugSchema = optionalTextSchema.pipe(
  z
    .string()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .max(120)
    .nullable()
);

export const momentFormSchema = z.object({
  description: optionalTextSchema,
  location: optionalTextSchema,
  noteMarkdown: optionalTextSchema,
  occurredAt: optionalDateSchema,
  slug: optionalSlugSchema,
  title: z.string().trim().min(1).max(120),
});

export const cloudinaryUploadResultSchema = z
  .object({
    asset_id: z.string().trim().min(1).optional(),
    bytes: z.coerce.number().int().nonnegative(),
    format: z.string().trim().min(1),
    height: z.coerce.number().int().positive(),
    original_filename: z.string().trim().min(1).optional(),
    public_id: z.string().trim().min(1),
    resource_type: z.enum(["image", "video", "raw", "auto"]),
    secure_url: z.string().url(),
    width: z.coerce.number().int().positive(),
  })
  .passthrough();

export type CloudinaryUploadResult = z.infer<
  typeof cloudinaryUploadResultSchema
>;
export type MomentFormValues = z.infer<typeof momentFormSchema>;
export type MomentStatus = z.infer<typeof momentStatusSchema>;
export type MomentVisibility = z.infer<typeof momentVisibilitySchema>;
