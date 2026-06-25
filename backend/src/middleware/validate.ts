<<<<<<< HEAD
import { Request, Response, NextFunction } from 'express';
import { z, ZodSchema } from 'zod';
=======
import { Request, Response, NextFunction } from "express";
import { z, ZodSchema } from "zod";
>>>>>>> 1ffa244ce9d959b0dbdc0e06d9b8fbe8ee15f699

export const validate = (schema: ZodSchema) =>
  (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
<<<<<<< HEAD
      const errors = result.error.errors.map(e => ({
        field:   e.path.join('.'),
        message: e.message,
      }));
      res.status(422).json({ success: false, message: 'Validation failed', errors });
=======
      res.status(422).json({
        success: false,
        message: "Validation failed",
        errors:  result.error.errors.map(e => ({ field: e.path.join("."), message: e.message })),
      });
>>>>>>> 1ffa244ce9d959b0dbdc0e06d9b8fbe8ee15f699
      return;
    }
    req.body = result.data;
    next();
  };

<<<<<<< HEAD
/* ── Schemas ─────────────────────────────────────────────────── */
=======
/* ── Schemas ──────────────────────────────────────────────────── */
>>>>>>> 1ffa244ce9d959b0dbdc0e06d9b8fbe8ee15f699
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
<<<<<<< HEAD
  category:    z.enum(['Entertainment','Music','Cloud','Design','Development','Productivity','Health','Finance','Education','Other']).optional(),
  price:       z.number().min(0).max(100_000),
  billing:     z.enum(['monthly','quarterly','annually']).optional(),
=======
  category:    z.enum(["Entertainment","Music","Cloud","Design","Development",
                        "Productivity","Health","Finance","Education","Other"]).optional(),
  price:       z.number().min(0).max(999_999),
  billing:     z.enum(["monthly","quarterly","annually"]).optional(),
>>>>>>> 1ffa244ce9d959b0dbdc0e06d9b8fbe8ee15f699
  nextRenewal: z.coerce.date(),
  notes:       z.string().max(500).optional(),
  color:       z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
});

<<<<<<< HEAD
export const subscriptionUpdateSchema = subscriptionSchema.partial();
=======
export const subUpdateSchema = subscriptionSchema.partial();
>>>>>>> 1ffa244ce9d959b0dbdc0e06d9b8fbe8ee15f699
