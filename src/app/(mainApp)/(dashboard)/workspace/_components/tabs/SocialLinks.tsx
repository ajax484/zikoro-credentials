import { zodResolver } from "@hookform/resolvers/zod";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import toast from "react-hot-toast";
import { Pen, Trash, X } from "lucide-react";
import { uploadFile } from "@/utils/helpers";
import InputOffsetLabel from "@/components/InputOffsetLabel";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import useOrganizationStore from "@/store/globalOrganizationStore";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Facebook, Instagram, Linkedin } from "styled-icons/bootstrap";

const socialLinksSchema = z.object({
  linkedin: z.string().url("Enter a valid URL"),
  instagram: z.string().url("Enter a valid URL"),
  facebook: z.string().url("Enter a valid URL"),
  x: z.string().url("Enter a valid URL"),
});

const SocialLinks = () => {
  const { organization } = useOrganizationStore();

  const form = useForm<z.infer<typeof socialLinksSchema>>({
    resolver: zodResolver(socialLinksSchema),
    defaultValues: {
      linkedin: organization?.linkedin,
      instagram: organization?.instagram,
      facebook: organization?.facebook,
      x: organization?.x,
    },
  });

  const onSubmit = async (data: z.infer<typeof socialLinksSchema>) => {
    console.log(data);
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
              name="linkedin"
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
          <Button className="bg-basePrimary text-white" type="submit">
            Save
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default SocialLinks;
