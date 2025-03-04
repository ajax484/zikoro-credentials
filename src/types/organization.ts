export interface TOrganization {
  id: number;
  created_at: string;
  organizationName: string;
  organizationSlug: string;
  subscriptionPlan: string;
  subscritionStartDate: string;
  subscriptionEndDate: string;
  organizationOwner: string;
  organizationAlias: string;
  BillingAddress: string;
  TaxID: string;
  payoutAccountDetails: IPayoutAccountDetails | null;
  organizationOwnerId: number;
  organizationType: string;
  organizationLogo: string;
  favicon: string;
  country: string;
  eventPhoneNumber: string;
  eventWhatsApp: string;
  eventContactEmail: string;
  x: string;
  linkedIn: string;
  instagram: string;
  facebook: string;
  subDomain: string;
  certificateAsset: TCertificateAsset;
  teamMembers: TOrganizationTeamMember[];
  subscriptionExpiryDate: string;
  socialLinks: { title: string; url: string }[];
  verification: OrganizationVerification[];
  role: { userRole: string }[];
}

export interface IPayoutAccountDetails {
  bankCountry: string;
  currency: string;
  accountNumber: string;
  accountName: string;
  bankName: string;
  bankCode: string;
}

type TOrganizationTeamMember = {
  userId: string;
  userEmail: string;
  userRole: string;
};
export interface TCertificateAsset {
  elements: string[];
  backgrounds: string[];
}

export interface OrganizationTeamMembersCredentials {
  id: number;
  created_at: string;
  userId?: number | null;
  userEmail?: string | null;
  userRole?: string | null;
  workspaceAlias?: string | null;
}

export interface CredentialsWorkspaceInvite {
  id: number;
  createdAt: string;
  email: string;
  role: string;
  workspaceAlias: string;
  status: string;
}

export interface OrganizationVerification {
  id: number;
  createdAt: string;
  workspaceAlias?: string | null;
  address?: string | null;
  country?: string | null;
  year?: string | null;
  documentLink?: string | null;
  status?: string | null;
  createdBy: number;
}
