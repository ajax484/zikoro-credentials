import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import { Hint } from "@/components/hint";
import { Icon } from "@phosphor-icons/react";

interface SidebarItemProps {
  icon: Icon;
  label: string;
  isActive?: boolean;
  onClick: () => void;
  numKey: string;
}

export const SidebarItem = ({
  icon: Icon,
  label,
  isActive,
  onClick,
  numKey,
}: SidebarItemProps) => {
  useEffect(() => {
    interface KeyboardEventWithKey extends KeyboardEvent {
      key: string;
    }

    const handleKeyDown = (e: KeyboardEventWithKey) => {
      const isCtrlKey = e.ctrlKey || e.metaKey;
      const isInput = ["INPUT", "TEXTAREA"].includes(
        (e.target as HTMLElement).tagName
      );

      if (isCtrlKey && e.key === numKey) {
        console.log("Delete/Backspace key pressed");
        // Your delete logic here
        onClick();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <Hint label={label + ` (ctrl + ${numKey})`} side="bottom" sideOffset={10}>
      <Button
        variant="ghost"
        onClick={onClick}
        className={cn(
          "flex aspect-video h-full w-full flex-col rounded-none px-3 py-4 group group-hover:bg-basePrimary/10 group-hover:text-basePrimary transition-all duration-300 ease-in-out",
          isActive && "bg-basePrimary/10 text-basePrimary"
        )}
      >
        <Icon
          size={24}
          weight={"duotone"}
          className={cn(
            "shrink-0 stroke-2 group-hover:stroke-basePrimary group-hover:fill-basePrimary",
            isActive &&
              "text-basePrimary stroke-basePrimary fill-basePrimary"
          )}
        />
        <span className="mt-2 text-xs">{label}</span>
      </Button>
    </Hint>
  );
};
