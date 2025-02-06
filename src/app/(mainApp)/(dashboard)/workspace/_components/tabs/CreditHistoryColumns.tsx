import { cn } from "@/lib/utils";
import { CredentialTokenUsageHistory } from "@/types/token";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";

export const creditHistoryColumns: ColumnDef<CredentialTokenUsageHistory>[] = [
  {
    accessorKey: "activity",
    header: "Transaction type",
    cell: ({ getValue }) => {
      const activity = getValue() as string;

      return (
        <div
          className={cn(
            "text-sm font-medium rounded-md text-white p-2 w-fit",
            activity === "credit" ? "bg-green-500" : "bg-red-500"
          )}
        >
          {activity}
        </div>
      );
    },
  },
  {
    accessorKey: "tokenId",
    header: "Token type",
    cell: ({ getValue }) => {
      const tokenId = getValue() as number;
      const tokenIdMap: Record<number, Record<string, any>> = {
        1: {
          label: "Bronze",
          icon: (
            <div className="rounded-full p-0.5 [background:_linear-gradient(340.48deg,_#87704F_13.94%,_#CBC6C5_83.24%);]">
              <div className="rounded-full size-5 [box-shadow:_0px_8px_12px_0px_#C2AF9B66;] [background:_linear-gradient(340.48deg,_#87704F_13.94%,_#CBC6C5_83.24%);]" />
            </div>
          ),
        },
        2: {
          label: "Silver",
          icon: (
            <div className="rounded-full p-0.5 [background:_linear-gradient(121.67deg,_#B6C0D6_22.73%,_rgba(107,_106,_123,_0.84)_79.34%),_linear-gradient(0deg,_rgba(0,_0,_0,_0.1),_rgba(0,_0,_0,_0.1));]">
              <div className="rounded-full size-5 [background:_linear-gradient(121.67deg,_#B6C0D6_22.73%,_rgba(107,_106,_123,_0.84)_79.34%),_linear-gradient(0deg,_rgba(0,_0,_0,_0.1),_rgba(0,_0,_0,_0.1));]" />
            </div>
          ),
        },
        3: {
          label: "Gold",
          icon: (
            <div className="rounded-full p-0.5 [background:_linear-gradient(147.61deg,_#FFE092_12.55%,_#E3A302_86.73%);]">
              <div className="rounded-full size-5 [background:_linear-gradient(147.61deg,_#FFE092_12.55%,_#E3A302_86.73%);]" />
            </div>
          ),
        },
      };

      return (
        <div className="flex items-center gap-2">
          {tokenIdMap[tokenId].icon}
          <span>{tokenIdMap[tokenId].label}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "creditAmount",
    header: "Credit Amount",
  },
  {
    accessorKey: "created_at",
    header: "Transaction Date",
    cell: ({ getValue }) => {
      const date = getValue() as Date;
      return format(date, "dd/MM/yyyy hh:mm");
    },
  },
];
