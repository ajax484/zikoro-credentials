export interface CredentialsIntegration {
  id: number;
  created_at: Date;
  integrationName: string;
  integrationAlias: string;
  integrationType: string;
  totalIssued: number;
  disconnect: boolean;
  integrationSettings: Record<string, unknown> | null;
  workspaceAlias: string;
  templateId: number;
  credentialId: string;
}

export interface Quiz {
  id: number;
  created_at: Date;
  lastUpdated_at: Date;
  coverTitle: string;
  description: string;
  coverImage: string;
  branding: Record<string, unknown>;
  questions: Record<string, unknown>;
  totalDuration: number;
  totalPoints: number;
  quizAlias: string;
  eventAlias: string;
  quizParticipants: Record<string, unknown>;
  quizSettings: Record<string, unknown>;
  accessibility: Record<string, unknown>;
  liveMode: Record<string, unknown>;
  interactionType: string;
  formAlias: string;
  workspaceAlias: string;
  createdBy: number;
  integrationAlias: string;
  templateId: number;
  form: Forms;
}

export interface Forms {
  id: number;
  created_at: Date;
  title: string;
  description: string;
  coverImage: string;
  createdBy: number;
  updatedAt: Date;
  isActive: boolean;
  expirationDate: Date;
  questions: {
    question: string;
    questionImage: string;
    isRequired: boolean;
    questionId: string;
    showDescription: boolean;
    selectedType: string;
  }[];
  formAlias: string;
  eventAlias: string;
  formSettings: Record<string, unknown>;
  workspaceAlias: string;
  integrationAlias: string;
}
