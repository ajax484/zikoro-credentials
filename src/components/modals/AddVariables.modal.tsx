import React, { useEffect } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { DialogClose } from "@radix-ui/react-dialog";
import { LoaderAlt } from "styled-icons/boxicons-regular";

const AddVariables = ({
  attributes,
  setAttributes,
  save,
  isSaving,
}: {
  attributes: string[];
  setAttributes: React.Dispatch<React.SetStateAction<string[]>>;
  save: () => Promise<void>;
  isSaving: boolean;
}) => {
  const [attribute, setAttribute] = React.useState("");

  const clsBtnRef = React.useRef<HTMLButtonElement>(null);

  const onSubmit = async () => {
    setAttributes([...attributes, attribute]);
    setAttribute("");
  };

  useEffect(() => {
    (async () => {
      await save();
      clsBtnRef.current?.click();
    })();
  }, [attributes]);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="text-basePrimary text-sm border border-basePrimary bg-white hover:bg-white mx-4 mt-4">
          Add Custom Attribute
        </Button>
      </DialogTrigger>
      <DialogContent>
        <div className="space-y-6">
          <div className="flex flex-col gap-2 w-full">
            <label className="font-medium text-gray-700">Attribute</label>
            <Input
              type="text"
              placeholder="Enter attribute"
              className=" placeholder:text-sm h-12 focus:border-gray-500 placeholder:text-gray-200 text-gray-700"
              onInput={(e) => setAttribute(e.currentTarget.value)}
              value={attribute}
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            disabled={isSaving || attributes.includes(attribute)}
            onClick={onSubmit}
            className="mt-4 w-full gap-x-2 hover:bg-opacity-70 bg-basePrimary h-12 rounded-md text-gray-50 font-medium"
          >
            {isSaving && <LoaderAlt size={22} className="animate-spin" />}
            <span>Add {attribute}</span>
          </Button>
          <DialogClose>
            <button className="hidden" ref={clsBtnRef}>
              close
            </button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddVariables;
