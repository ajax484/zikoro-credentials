import { CredentialsIntegration } from "@/types/integrations";
import { ColumnDef } from "@tanstack/react-table";

export const columns: ColumnDef<CredentialsIntegration>[] = [
  {
    accessorKey: "integrationName",
    header: "Integration Name",
  },
  {
    accessorKey: "integrationAlias",
    header: "Integration Alias",
  },
  {
    accessorKey: "integrationType",
    header: "Integration Type",
  },
  {
    accessorKey: "totalIssued",
    header: "Total Issued",
  },
];
