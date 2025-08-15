import { z } from "zod";

export const directoryRecipientSchema = z.object({
  first_name: z.string(),
  last_name: z.string(),
  profile_picture: z.string().optional(),
  email: z.string(),
  phone: z.string().optional(),
  instagram: z.string().optional(),
  linkedin: z.string().optional(),
  facebook: z.string().optional(),
  twitter: z.string().optional(),
  recipientAlias: z.string(),
  directoryAlias: z.string().min(1),
});
