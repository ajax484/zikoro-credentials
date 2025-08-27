import { directoryRecipientSchema } from "@/schemas/directory";
import { z } from "zod";
import { CertificateRecipient, TCertificate } from "./certificates";

export interface Directory {
  organizationAlias: string;
  directoryAlias: string;
  directoryName: string;
  id: string;
  createdAt: string;
  updatedAt: string;
  recipientCount: number;
  certificatesCount: number;
  expiredCount: number;
}

export type DirectoryRecipient = z.infer<typeof directoryRecipientSchema> & {
  directory_id: string;
  created_at: string;
  id: number;
  assignedCertificates: (CertificateRecipient & {
    certificate: TCertificate;
  })[];
};
