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
  SelectGroup,
  SelectLabel,
} from "@/components/ui/select";
import { Button } from "../ui/button";
import { Loader, PlusCircle } from "lucide-react";
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
import { CertificateTemplate, CredentialType } from "@/types/certificates";
import { cn } from "@/lib/utils";
import { CaretLeft, CaretRight } from "@phosphor-icons/react";
import { convertFromPixels, convertToPixels } from "@/utils/helpers";
import { paperSeries, paperSizes } from "../editor/components/settings-sidebar";
import { ScrollArea } from "../ui/scroll-area";

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
    credentialType: CredentialType;
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

  console.log(templates);

  const [workspace, setWorkspace] = useState<TOrganization | null>(
    organization
  );

  const [name, setName] = useState<string>("Untitled credential");

  const updateWorkspace = (workspace: TOrganization | null) => {
    setWorkspace(workspace);
    setOrganization(workspace);
  };

  const [selectedTemplate, setSelectedTemplate] =
    useState<CertificateTemplate | null>(null);
  const [type, setType] = useState<string>("template");
  const [credentialType, setCredentialType] =
    useState<CredentialType>("certificate");

  console.log(templates[0]?.JSON);

  const defaultSize = paperSizes.find((size) => size.sizing === "a4");
  const [width, setWidth] = useState(
    defaultSize?.width ? convertToPixels(defaultSize?.width, "cm") ?? 900 : 900
  );
  const [height, setHeight] = useState(
    defaultSize?.height
      ? convertToPixels(defaultSize?.height, "cm") ?? 1200
      : 1200
  );
  const [sizing, setSizing] = useState("a4");

  const [orientation, setOrientation] = useState<
    "portrait" | "landscape" | "default"
  >("portrait");

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{triggerButton}</DialogTrigger>
      <DialogContent className="max-w-[50%] !px-0">
        <DialogHeader className="px-2">
          <DialogTitle>Create</DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[90vh]">
          <div className="space-y-4 hide-scrollbar px-2">
            <div className="flex flex-col gap-2 w-full">
              <label className="font-medium text-gray-700">
                What would you like to create?
              </label>
              <Select
                value={credentialType}
                onValueChange={(value) =>
                  setCredentialType(value as CredentialType)
                }
              >
                <SelectTrigger className="w-full rounded-lg bg-white font-medium">
                  <SelectValue placeholder={"Select type"} />
                </SelectTrigger>
                <SelectContent>
                  {[
                    { label: "Certificate", value: "certificate" },
                    { label: "Event Badge", value: "badge" },
                    { label: "Product Label", value: "product label" },
                    { label: "Shipping Label", value: "shipping label" },
                  ].map((type, index) => (
                    <SelectItem value={type.value} key={index}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-2 w-full">
              <label className="font-medium text-gray-700">Sizing</label>
              <Select
                value={sizing}
                onValueChange={(value) => {
                  const paperSize = paperSizes.find(
                    (size) => size.sizing === value
                  );
                  if (!paperSize) return;

                  const { height, width, sizing } = paperSize;
                  const heightInPixels = convertToPixels(Number(height), "cm");
                  const widthInPixels = convertToPixels(Number(width), "cm");
                  setHeight(heightInPixels);
                  setWidth(widthInPixels);
                  setSizing(sizing);
                }}
                defaultValue={sizing}
              >
                <SelectTrigger className="w-full rounded-lg text-sm font-medium bg-transparent">
                  <SelectValue placeholder="Select paper size" />
                </SelectTrigger>
                <SelectContent className="z-[1001]">
                  {paperSeries.map((seriesGroup) => {
                    const sizesInSeries = paperSizes.filter(
                      (size) => size.series === seriesGroup
                    );

                    if (sizesInSeries.length === 0) return null;

                    return (
                      <SelectGroup key={seriesGroup}>
                        <SelectLabel className="capitalize">
                          {seriesGroup}
                        </SelectLabel>
                        {sizesInSeries.map((size) => {
                          const { height, width, label, sizing } = size;

                          return (
                            <SelectItem
                              key={sizing}
                              value={sizing}
                              data-height={height}
                              data-width={width}
                            >
                              {label}
                            </SelectItem>
                          );
                        })}
                      </SelectGroup>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-2 w-full">
              <label className="font-medium text-gray-700">Orientation</label>
              <Select
                value={orientation}
                onValueChange={(value) =>
                  setOrientation(value as "portrait" | "landscape" | "default")
                }
              >
                <SelectTrigger className="w-full rounded-lg bg-white font-medium">
                  <SelectValue placeholder={"Select orientation"} />
                </SelectTrigger>
                <SelectContent>
                  {[
                    { label: "Default", value: "default" },
                    { label: "Portrait", value: "portrait" },
                    { label: "Landscape", value: "landscape" },
                  ].map((type, index) => (
                    <SelectItem value={type.value} key={index}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

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
                        {templates
                          ?.filter(
                            (template) =>
                              template.credentialType === credentialType
                          )
                          .map((template, index) => (
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
                  Credential Name
                </label>
                <Input
                  type="text"
                  placeholder="Enter credential name"
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
                  let certificateHeight = height;
                  let certificateWidth = width;

                  if (orientation === "landscape") {
                    [certificateHeight, certificateWidth] = [width, height];
                  }

                  workspace &&
                    createCertificateFn({
                      name,
                      workspace,
                      JSON: {
                        json: JSON.stringify(selectedTemplate?.JSON) || null,
                        width: certificateWidth,
                        height: certificateHeight,
                      },
                      credentialType,
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
                  <Loader size={22} className="animate-spin" />
                )}
                <span>Create Credential</span>
              </Button>
            </DialogFooter>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default CreateCertificateDialog;
