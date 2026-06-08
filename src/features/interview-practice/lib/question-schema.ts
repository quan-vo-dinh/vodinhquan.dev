import { z } from "zod";

import { INTERVIEW_LEVELS } from "../types";

export const interviewQuestionRawSchema = z.object({
  id: z.number().int().positive(),
  category: z.string().min(1),
  subcategory: z.string().min(1),
  level: z.enum(INTERVIEW_LEVELS),
  q: z.string().min(1),
  a: z.string().min(1),
  q_en: z.string().min(1),
  a_en: z.string().min(1),
});

export const interviewQuestionRawListSchema = z.array(
  interviewQuestionRawSchema
);
