import { isValid } from "date-fns";
import { Event } from "./events";
import { TOrganization } from "./organization";

export type TAttendeeCertificate = {
  id?: number;
  created_at: string;
  eventId: number;
  eventAlias: string;
  attendeeEmail: string;
  certificateId: string;
  CertificateGroupId: number;
  certificateURL: string;
  CertificateName: string;
  attendeeId: number;
};

export type TIssuedCertificate = TAttendeeCertificate & {
  certificate: TCertificate;
};

type ValuePiece = Date | null;

export interface TCertificateDetails {
  verification: { showId: boolean; showQRCode: boolean; showURL: boolean };
  background: string | null;
  craftHash: string;
}
export interface TCertificate {
  id?: number;
  created_at: Date;
  eventAlias: string;
  name: string;
  certificateSettings: TCertificateSettings;
  event?: Event;
  lastEdited: Date;
  previewUrl?: string;
  certificateHash: Record<string, any>;
  certificateAlias: string;
  JSON: Record<string, any>;
  workspaceAlias: string;
  recipientCount: number;
  createdBy: number;
  isValid: boolean;
  attributes: string[];
  hasQRCode: boolean;
}

export interface TCertificateSettings {
  canReceive: {
    eventAttendees: boolean;
    trackAttendees: boolean;
    sessionAttendees: boolean;
    quizParticipants: boolean;
    exceptions?: number[];
  };
  criteria: number;
  canExpire: boolean;
  expiryDate: Date;
  skills: { color: string; value: string }[];
  publishOn: Date;
}

export type TFullCertificate = TAttendeeCertificate & {
  originalCertificate: TCertificate & {
    event: Event & { organization: TOrganization };
  };
};

export interface CertificateTemplate {
  id: number;
  created_at: Date;
  templateName: string;
  templateUrl: string;
  certificateTemplate: string;
  category: string;
  figmaName: string;
  colour: string;
}

export type issueActions =
  | "issued"
  | "email sent"
  | "email opened"
  | "revoked"
  | "email resent"
  | "reissued";

export interface CertificateRecipient {
  id: number;
  created_at: string;
  certificateId: string | null;
  recipientFirstName: string;
  recipientLastName: string;
  recipientEmail: string;
  status: issueActions;
  statusDetails: { action: issueActions; date: string }[] | null;
  profilePicture?: string | null;
  metadata?: Record<string, any> | null;
  certificateGroupId: number;
  recipientAlias: string;
  isValid: boolean;
  hasQRCode: boolean;
}
