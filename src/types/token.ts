export type CredentialsWorkspaceToken = {
  id: number;
  created_at: string;
  workspaceId?: number | null;
  tokenId?: number | null;
  currency?: string;
  amountPaid?: number;
  CreditPurchased?: number;
  expiryDate?: string | null;
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
