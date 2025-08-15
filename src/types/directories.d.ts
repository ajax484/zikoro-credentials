import { directoryRecipientSchema } from "@/schemas/directory";
import { z } from "zod";

export interface Directory {
  organizationAlias: string;
  directoryAlias: string;
  directoryName: string;
  id: string;
  createdAt: string;
  updatedAt: string;
}

export type DirectoryRecipient = z.infer<typeof directoryRecipientSchema> & {
  directory_id: string;
  created_at: string;
};
