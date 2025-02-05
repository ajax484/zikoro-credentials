import { ActiveTool, Editor } from "@/components/editor/types";
import { ToolSidebarClose } from "@/components/editor/components/tool-sidebar-close";
import { ToolSidebarHeader } from "@/components/editor/components/tool-sidebar-header";

import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import AddVariables from "@/components/modals/AddVariables.modal";

interface VerificationSidebarProps {
  editor: Editor | undefined;
  activeTool: ActiveTool;
  onChangeActiveTool: (tool: ActiveTool) => void;
  attributes: string[];
  setAttributes: React.Dispatch<React.SetStateAction<string[]>>;
  save: () => Promise<void>;
  isSaving: boolean;
}

export const VerificationSidebar = ({
  editor,
  activeTool,
  onChangeActiveTool,
  attributes,
  setAttributes,
  save,
  isSaving,
}: VerificationSidebarProps) => {
  const onClose = () => {
    onChangeActiveTool("select");
  };

  return (
    <aside
      className={cn(
        "relative z-[40] flex h-full w-[360px] flex-col border-r bg-white",
        activeTool === "verification" ? "visible" : "hidden"
      )}
    >
      <ToolSidebarHeader
        title="Attributes"
        description="Add attributes to your credential"
      />
      <AddVariables
        attributes={attributes}
        setAttributes={setAttributes}
        save={save}
        isSaving={isSaving}
      />
      <ScrollArea>
        <div className="space-y-4 border-b p-4">
          <Button
            className="h-16 w-full"
            variant="secondary"
            size="lg"
            onClick={() =>
              editor?.addText("Certificate ID: #{certificateId#}", {
                fontSize: 32,
                textAlign: "center",
              })
            }
          >
            Add Certificate Id
          </Button>
          <Button
            className="h-16 w-full"
            variant="secondary"
            size="lg"
            onClick={() =>
              editor?.addText("#{first_name#}", {
                fontSize: 32,
                textAlign: "center",
              })
            }
          >
            Add Recipient First name
          </Button>
          <Button
            className="h-16 w-full"
            variant="secondary"
            size="lg"
            onClick={() =>
              editor?.addText("#{last_name#}", {
                fontSize: 32,
                textAlign: "center",
              })
            }
          >
            Add Recipient Last name
          </Button>
          <Button
            className="h-16 w-full"
            variant="secondary"
            size="lg"
            onClick={() =>
              editor?.addText("#{first_name#} #{last_name#}", {
                fontSize: 32,
                textAlign: "center",
              })
            }
          >
            Add Recipient full name
          </Button>
          <Button
            className="h-16 w-full"
            variant="secondary"
            size="lg"
            onClick={() =>
              editor?.addText(
                "https://www.credentials.zikoro.com/credentials/verify/certificate/#{certificateId#}",
                {
                  fontSize: 32,
                  textAlign: "center",
                }
              )
            }
          >
            Add Verification URL
          </Button>
          <Button
            className="h-16 w-full"
            variant="secondary"
            size="lg"
            onClick={() => editor?.addImage("#{placeholder_profile}#")}
          >
            Add Profile Image
          </Button>
          {attributes.length > 0 &&
            attributes.map((attribute) => (
              <Button
                className="h-16 w-full"
                variant="secondary"
                size="lg"
                onClick={() =>
                  editor?.addText(`#{${attribute}#}`, {
                    fontSize: 32,
                    textAlign: "center",
                  })
                }
              >
                Add {attribute}
              </Button>
            ))}
        </div>
      </ScrollArea>
      <ToolSidebarClose onClick={onClose} />
    </aside>
  );
};
