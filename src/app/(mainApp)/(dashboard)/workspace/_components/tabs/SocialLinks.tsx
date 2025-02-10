import { zodResolver } from "@hookform/resolvers/zod";
import React, { useRef, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";
import { Form, FormField } from "@/components/ui/form";
import { Delete, Link, Trash, X } from "lucide-react";
import InputOffsetLabel from "@/components/InputOffsetLabel";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import useOrganizationStore from "@/store/globalOrganizationStore";
import { Facebook, Instagram, Linkedin } from "styled-icons/bootstrap";
import { useMutateData } from "@/hooks/services/request";

const socialLinksSchema = z.object({
  linkedIn: z.string().url("Enter a valid URL").optional(),
  instagram: z.string().url("Enter a valid URL").optional(),
  facebook: z.string().url("Enter a valid URL").optional(),
  x: z.string().url("Enter a valid URL").optional(),
  socialLinks: z
    .array(z.string().url("Enter a valid URL").optional())
    .optional(),
});

const SocialLinks = () => {
  const { organization, setOrganization } = useOrganizationStore();

  const { mutateData: updateWorkspace, isLoading: updateWorkspaceIsLoading } =
    useMutateData(`/workspaces/${organization?.id}`);

  const form = useForm<z.infer<typeof socialLinksSchema>>({
    resolver: zodResolver(socialLinksSchema),
    defaultValues: {
      linkedIn: organization?.linkedIn,
      instagram: organization?.instagram,
      facebook: organization?.facebook,
      x: organization?.x,
      socialLinks: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "socialLinks",
  });

  const onSubmit = async (data: z.infer<typeof socialLinksSchema>) => {
    console.log(data);
    const updatedOrganization = await updateWorkspace({
      payload: { ...organization, ...data },
    });
    console.log(updatedOrganization);
    setOrganization(updatedOrganization);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-sm font-medium text-gray-600 text-center">
        Edit your workspace information
      </h2>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-2 gap-4 items-center flex-1">
            <FormField
              control={form.control}
              name="linkedIn"
              render={({ field }) => (
                <InputOffsetLabel
                  label="Linkedin"
                  append={
                    <div className="bg-white p-1 rounded-md">
                      <Linkedin className="size-6" />
                    </div>
                  }
                >
                  <div className="relative w-full">
                    <Input
                      placeholder="workspace name"
                      type="text"
                      {...field}
                      className="placeholder:text-sm focus:border-gray-500 placeholder:text-gray-200 text-gray-700"
                    />
                  </div>
                </InputOffsetLabel>
              )}
            />
            <FormField
              control={form.control}
              name="x"
              render={({ field }) => (
                <InputOffsetLabel
                  label="X"
                  append={
                    <div className="bg-white p-1 rounded-md">
                      <X className="size-6" />
                    </div>
                  }
                >
                  <div className="relative w-full">
                    <Input
                      placeholder="X"
                      type="text"
                      {...field}
                      className="placeholder:text-sm focus:border-gray-500 placeholder:text-gray-200 text-gray-700"
                    />
                  </div>
                </InputOffsetLabel>
              )}
            />
            <FormField
              control={form.control}
              name="instagram"
              render={({ field }) => (
                <InputOffsetLabel
                  label="instagram"
                  append={
                    <div className="bg-white p-1 rounded-md">
                      <Instagram className="size-6" />
                    </div>
                  }
                >
                  <div className="relative w-full">
                    <Input
                      placeholder="workspace name"
                      type="text"
                      {...field}
                      className="placeholder:text-sm focus:border-gray-500 placeholder:text-gray-200 text-gray-700"
                    />
                  </div>
                </InputOffsetLabel>
              )}
            />
            <FormField
              control={form.control}
              name="facebook"
              render={({ field }) => (
                <InputOffsetLabel
                  label="Facebook"
                  append={
                    <div className="bg-white p-1 rounded-md">
                      <Facebook className="size-6" />
                    </div>
                  }
                >
                  <div className="relative w-full">
                    <Input
                      placeholder="X"
                      type="text"
                      {...field}
                      className="placeholder:text-sm focus:border-gray-500 placeholder:text-gray-200 text-gray-700"
                    />
                  </div>
                </InputOffsetLabel>
              )}
            />
            {fields.map((field, index) => (
              <FormField
                key={field.id}
                control={form.control}
                name={`socialLinks.${index}`}
                render={({ field }) => (
                  <InputOffsetLabel
                    label={`socialLink${index + 1}`}
                    append={
                      <div className="bg-white p-1 rounded-md">
                        <Link className="size-6" />
                      </div>
                    }
                  >
                    <div className="relative w-full flex">
                      <Input
                        placeholder="X"
                        type="text"
                        {...field}
                        className="placeholder:text-sm focus:border-gray-500 placeholder:text-gray-200 text-gray-700"
                      />
                      <button
                        type="button"
                        aria-label="Delete social link"
                        className="text-red-600"
                        onClick={() => remove(index)}
                      >
                        <Trash className="size-4" />
                      </button>
                    </div>
                  </InputOffsetLabel>
                )}
              />
            ))}
          </div>
          <button
            type="button"
            className="text-sm text-sky-600 hover:text-sky-700 underline block"
            onClick={() => append("https://")}
          >
            <span>Add new social link</span>
          </button>

          <Button className="bg-basePrimary text-white" type="submit">
            Save
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default SocialLinks;
