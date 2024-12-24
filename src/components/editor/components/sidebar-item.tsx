import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface SidebarItemProps {
  icon: LucideIcon;
  label: string;
  isActive?: boolean;
  onClick: () => void;
}

export const SidebarItem = ({
  icon: Icon,
  label,
  isActive,
  onClick,
}: SidebarItemProps) => {
  return (
    <Button
      variant="ghost"
      onClick={onClick}
      className={cn(
        "flex aspect-video h-full w-full flex-col rounded-none p-3 py-4 group group-hover:bg-basePrimary/10 group-hover:text-basePrimary transition-all duration-300 ease-in-out",
        isActive && "bg-basePrimary/10 text-basePrimary"
      )}
    >
      <Icon
        className={cn(
          "size-5 shrink-0 stroke-2 group-hover:stroke-basePrimary group-hover:fill-basePrimary/10",
          isActive && "text-basePrimary stroke-basePrimary fill-basePrimary/10"
        )}
      />
      <span className="mt-2 text-xs">{label}</span>
    </Button>
  );
};
