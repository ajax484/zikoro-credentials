export type CredentialsWorkspaceToken = {
  id: number;
  created_at: string;
  workspaceId?: number | null;
  tokenId?: number | null;
  currency?: string | null;
  amountPaid?: number | null;
  CreditPurchased?: number | null;
  expiryDate?: string | null;
  discountCode?: string | null;
  discountValue?: number | null;
};