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

export const optionalUrl = z
  .string()
  .trim()
  .optional()
  .refine((val) => !val || z.string().url().safeParse(val).success, {
    message: "Enter a valid URL",
  });

const socialLinksSchema = z.object({
  linkedIn: optionalUrl,
  instagram: optionalUrl,
  facebook: optionalUrl,
  x: optionalUrl,
  socialLinks: z
    .array(
      z.object({
        title: z.string().min(1),
        url: optionalUrl,
      })
    )
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
      socialLinks: organization?.socialLinks || [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "socialLinks",
  });

  const onSubmit = async (data: z.infer<typeof socialLinksSchema>) => {
    console.log(data);
    const updatedOrganization = await updateWorkspace({
      payload: { ...data },
    });
    console.log(updatedOrganization);
    updatedOrganization && setOrganization(updatedOrganization);
  };

  return (
    <div className="space-y-6">
      <h2 className="font-medium text-gray-600 text-center">
        Edit your workspace information
      </h2>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
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
          </div>
          <div className="space-y-4">
            <h1 className="text-lg font-bold text-center text-gray-800">
              Custom Links
            </h1>
            <div className="grid grid-cols-2 gap-4 items-center flex-1">
              {fields.map((field, index) => (
                <div className="flex flex-col gap-1 border p-2 rounded-md relative">
                  <button
                    type="button"
                    aria-label="Delete link"
                    className="absolute top-1 right-1 z-10"
                    onClick={() => remove(index)}
                  >
                    <X className="size-6 text-red-600" />
                  </button>
                  <FormField
                    key={field.id}
                    control={form.control}
                    name={`socialLinks.${index}.title`}
                    render={({ field }) => (
                      <InputOffsetLabel label={`Link title`}>
                        <div className="relative w-full flex">
                          <Input
                            placeholder="link title"
                            type="text"
                            {...field}
                            className="placeholder:text-sm focus:border-gray-500 placeholder:text-gray-200 text-gray-700"
                          />
                        </div>
                      </InputOffsetLabel>
                    )}
                  />
                  <FormField
                    key={field.id}
                    control={form.control}
                    name={`socialLinks.${index}.url`}
                    render={({ field }) => (
                      <InputOffsetLabel label={`Link Url`}>
                        <div className="relative w-full flex">
                          <Input
                            placeholder="link url"
                            type="text"
                            {...field}
                            className="placeholder:text-sm focus:border-gray-500 placeholder:text-gray-200 text-gray-700"
                          />
                        </div>
                      </InputOffsetLabel>
                    )}
                  />
                </div>
              ))}
            </div>
            <button
              type="button"
              className="text-sm text-blue-500 hover:text-blue-700 underline w-full flex justify-center font-medium"
              onClick={() => append({ title: "", url: "" })}
            >
              <span>Add custom link</span>
            </button>
          </div>

          <Button className="bg-basePrimary text-white" type="submit">
            Save
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default SocialLinks;
