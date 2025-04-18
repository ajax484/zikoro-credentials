import useOrganizationStore from "@/store/globalOrganizationStore";
import { TOrganization } from "@/types/organization";
import { ReactNode, useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "../ui/button";
import { PlusCircle } from "lucide-react";
import { LoaderAlt } from "styled-icons/boxicons-regular";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "../ui/label";
import { AnimatePresence, motion } from "motion/react";
import { useFetchCertificateTemplates } from "@/queries/certificates.queries";
import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { CertificateTemplate } from "@/types/certificates";
import { cn } from "@/lib/utils";
import { CaretLeft, CaretRight } from "@phosphor-icons/react";

export interface CreateCertificateDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  createCertificateFn: ({
    name,
    workspace,
    JSON,
  }: {
    name: string;
    workspace: TOrganization;
    JSON: Record<string, any> | null;
  }) => void;
  certificateIsCreating: boolean;
  setDialogIsOpen: (open: boolean) => void;
  workspaces: TOrganization[];
  workspacesIsLoading: boolean;
  triggerButton: ReactNode;
}

const CreateCertificateDialog = ({
  open,
  setOpen,
  createCertificateFn,
  certificateIsCreating,
  setDialogIsOpen,
  workspaces,
  workspacesIsLoading,
  triggerButton,
}: CreateCertificateDialogProps) => {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!api) {
      return;
    }

    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap() + 1);

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap() + 1);
    });
  }, [api]);

  const { organization, setOrganization } = useOrganizationStore();
  const { data: templates, isFetching: templatesIsLoading } =
    useFetchCertificateTemplates();

  const [workspace, setWorkspace] = useState<TOrganization | null>(
    organization
  );

  const [name, setName] = useState<string>("Untitled Certificate");

  const updateWorkspace = (workspace: TOrganization | null) => {
    setWorkspace(workspace);
    setOrganization(workspace);
  };

  const [selectedTemplate, setSelectedTemplate] =
    useState<CertificateTemplate | null>(null);
  const [type, setType] = useState<string>("template");

  console.log(templates);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{triggerButton}</DialogTrigger>
      <DialogContent className="max-w-[50%]">
        <DialogHeader>
          <DialogTitle>Create Certificate</DialogTitle>
        </DialogHeader>
        <RadioGroup
          onValueChange={(value) => {
            setSelectedTemplate(null);
            setType(value);
          }}
          defaultValue={type}
          className="flex items-center gap-6 font-semibold"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem
              className="data-[state=checked]:!fill-basePrimary"
              value={"template"}
              id={"template"}
            />
            <Label htmlFor={"template"}>Start with a Template</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem
              className="data-[state=checked]:!fill-basePrimary"
              value={"scratch"}
              id={"scratch"}
            />
            <Label htmlFor={"scratch"}>Create from Scratch</Label>
          </div>
        </RadioGroup>
        <div>
          <AnimatePresence>
            {type === "template" ? (
              <motion.div
                key="templates"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "300px", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="w-full bg-[#f7f8f9] rounded-lg flex items-center justify-center"
              >
                <Carousel className="w-full" setApi={setApi}>
                  <CarouselContent className="-ml-1 relative px-4">
                    {templates?.map((template, index) => (
                      <CarouselItem
                        key={index}
                        className="pl-1 md:basis-1/2 lg:basis-1/3"
                      >
                        <button
                          onClick={() => setSelectedTemplate(template)}
                          aria-label={template.name}
                          key={template.id}
                          className={cn(
                            "group relative h-[250px] w-full overflow-hidden border bg-muted transition rounded-lg",
                            selectedTemplate?.id === template.id &&
                              "border-basePrimary"
                          )}
                        >
                          <img
                            src={template.previewUrl}
                            alt={"Image " + index}
                            className="object-fill"
                          />
                        </button>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <button
                    aria-label="Previous"
                    className="bg-white border p-4 rounded-full z-[999] absolute -translate-y-1/2 top-1/2 -left-2"
                    onClick={() => api?.scrollPrev()}
                  >
                    <CaretLeft className="size-4" />
                  </button>
                  <button
                    aria-label="Next"
                    className="bg-white border p-4 rounded-full z-[999] absolute -translate-y-1/2 top-1/2 -right-2"
                    onClick={() => api?.scrollNext()}
                  >
                    <CaretRight className="size-4" />
                  </button>
                </Carousel>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
        <div className="space-y-6">
          <div className="flex flex-col gap-2 w-full">
            <label className="font-medium text-gray-700">
              Certificate Name
            </label>
            <Input
              type="text"
              placeholder="Enter certificate name"
              className=" placeholder:text-sm h-12 focus:border-gray-500 placeholder:text-gray-200 text-gray-700"
              onInput={(e) => setName(e.currentTarget.value)}
              value={name}
            />
          </div>
          <div className="flex flex-col gap-2 w-full">
            <label className="font-medium text-gray-700">Workspace</label>
            <div className="flex items-center gap-4">
              <Select
                disabled={workspacesIsLoading}
                value={String(workspace?.id)}
                onValueChange={(value) =>
                  updateWorkspace(
                    workspaces?.find(({ id }) => id === parseInt(value))!
                  )
                }
              >
                <SelectTrigger className="w-full rounded-lg bg-white font-medium">
                  <SelectValue placeholder={"Select workspace"} />
                </SelectTrigger>
                <SelectContent>
                  {workspaces?.map(({ id, organizationName }) => (
                    <SelectItem value={String(id)} key={id}>
                      {organizationName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                onClick={() => setDialogIsOpen(true)}
                className="bg-basePrimary gap-x-2 py-1 text-gray-50 font-medium flex items-center justify-center rounded-lg w-fit text-xs"
              >
                <span>New Workspace</span>
                <PlusCircle className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button
            onClick={() => {
              workspace &&
                createCertificateFn({
                  name,
                  workspace,
                  JSON: selectedTemplate?.JSON || null,
                });
              setOpen(false);
            }}
            disabled={
              certificateIsCreating ||
              name === "" ||
              !workspace ||
              (selectedTemplate === null && type === "template")
            }
            className="mt-4 w-full gap-x-2 hover:bg-opacity-70 bg-basePrimary h-12 rounded-lg text-gray-50 font-medium"
          >
            {certificateIsCreating && (
              <LoaderAlt size={22} className="animate-spin" />
            )}
            <span>Create Certificate</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateCertificateDialog;
