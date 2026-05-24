import { Request, Response, NextFunction } from "express";
import { z, ZodSchema } from "zod";

export const validate = (schema: ZodSchema) =>
  (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      res.status(422).json({
        success: false,
        message: "Validation failed",
        errors:  result.error.errors.map(e => ({ field: e.path.join("."), message: e.message })),
      });
      return;
    }
    req.body = result.data;
    next();
  };

/* ── Schemas ──────────────────────────────────────────────────── */
export const registerSchema = z.object({
  name:     z.string().min(2).max(60).trim(),
  email:    z.string().email().toLowerCase().trim(),
  password: z.string().min(8).max(128),
});

export const loginSchema = z.object({
  email:    z.string().email().trim(),
  password: z.string().min(1),
});

export const subscriptionSchema = z.object({
  name:        z.string().min(1).max(80).trim(),
  category:    z.enum(["Entertainment","Music","Cloud","Design","Development",
                        "Productivity","Health","Finance","Education","Other"]).optional(),
  price:       z.number().min(0).max(999_999),
  billing:     z.enum(["monthly","quarterly","annually"]).optional(),
  nextRenewal: z.coerce.date(),
  notes:       z.string().max(500).optional(),
  color:       z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
});

export const subUpdateSchema = subscriptionSchema.partial();
