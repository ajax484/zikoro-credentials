export type CredentialsWorkspaceToken = {
  id: number;
  created_at: string;
  workspaceId: number;
  tokenId: number;
  currency: string;
  amountPaid: number;
  CreditPurchased: number;
  creditRemaining: number;
  expiryDate: string;
  discountCode?: string | null;
  discountValue?: number | null;
};

export type CredentialCurrencyConverter = {
  id: number;
  created_at: string;
  currency: string;
  amount: number;
};

export type CredentialsToken = {
  id: number;
  created_at: string;
  name?: string | null;
  amount?: number | null;
};

export interface CredentialTokenUsageHistory {
  id: number;
  createdAt: Date;
  workspaceAlias: string;
  credentialId?: number | null;
  tokenId?: number | null;
  creditAmount: number;
  recipientDetails?: Record<string, any> | null; // json
  activityBy: number;
  activity: string;
  creditBalance: number;
  transactionReferenceId: string | null;
}
