import { z } from "zod";

export const directoryRecipientSchema = z.object({
  first_name: z.string(),
  last_name: z.string(),
  profile_picture: z.string().optional(),
  email: z.string(),
  phone: z.string().optional().nullable(),
  instagram: z.string().optional().nullable(),
  linkedIn: z.string().optional().nullable(),
  facebook: z.string().optional().nullable(),
  twitter: z.string().optional().nullable(),
  recipientAlias: z.string(),
  directoryAlias: z.string().min(1),
});
