"use client";
import { ArrowLeft, Pencil } from "@phosphor-icons/react";
import React, { useEffect, useState } from "react";
import DirectoryLogo from "@/public/icons/DirectoryLogo.svg";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import useOrganizationStore from "@/store/globalOrganizationStore";
import {
  useFetchDirectory,
  useFetchDirectoryRecipients,
} from "@/queries/directories.queries";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { Hint } from "@/components/hint";
import AddRecipientForm from "./_components/CreateRecipient";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";
import { DirectoryRecipient } from "@/types/directories";
import Link from "next/link";

const Directory = () => {
  const { organization } = useOrganizationStore();
  console.log(organization?.organizationAlias);

  const { data: directory, isFetching } = useFetchDirectory(
    organization?.organizationAlias!
  );

  const {
    data: recipients,
    isFetching: recipientsIsFetching,
    refetch,
  } = useFetchDirectoryRecipients(
    organization?.organizationAlias!,
    directory?.directoryAlias!
  );

  useEffect(() => {
    if (directory) {
      refetch();
    }
  }, [directory]);

  console.log(directory);

  console.log(recipients);

  const DirectoryRecipient = ({
    recipient,
  }: {
    recipient: DirectoryRecipient;
  }) => {
    return (
      <div className="rounded-md border bg-white">
        <div className="p-2 border-b">
          
            <Avatar className="size-12">
              <AvatarImage src={recipient?.profile_picture} />
              <AvatarFallback>
                {(recipient.first_name[0] || "#") +
                  (recipient.last_name[0] || "#")}
              </AvatarFallback>
            </Avatar>
          
          <Link
            className="font-semibold hover:underline hover:underline-offset-1"
            href={`/directory/${directory?.directoryAlias}/recipients/${recipient.recipientAlias}`}
          >
            {recipient.first_name + " " + recipient.last_name}
          </Link>
          <div className="text-xs flex gap-0.5 mb-2">
            <span className="text-zikoroGray">Last certified:</span>
            <span>12th, May 2024</span>
          </div>
          <div className="flex gap-2 flex-wrap mb-2">
            <div className="rounded-xl text-pink-500 bg-pink-50 border-pink-500 px-2 py-1 text-xs border">
              Label
            </div>
          </div>
          <div className="border rounded-md flex">
            <div className="flex flex-col gap-1 px-2 py-2 border-r">
              <span className="font-semibold">8</span>
              <span className="text-sm text-zikoroGray">Points</span>
            </div>
            <div className="flex flex-col gap-1 px-2 py-2 border-r">
              <span className="font-semibold">6</span>
              <span className="text-sm text-zikoroGray">Certificates</span>
            </div>
            <div className="flex flex-col gap-1 px-2 py-2">
              <span className="font-semibold">2</span>
              <span className="text-sm text-zikoroGray">Hrs</span>
            </div>
          </div>
        </div>
        <div className="flex justify-center items-center gap-1 p-1 text-xs">
          <span className="text-zikoroGray">Added on:</span>
          <span>{format(new Date(recipient.created_at), "dd MMM, yyyy")}</span>
        </div>
      </div>
    );
  };

  const [isRecipientDialog, toggleRecipientDialog] = useState(false);
  return (
    <section className="space-y-8">
      <section className="border-b py-4 flex justify-between items-center">
        <button className="rounded-full border bg-white p-2">
          <ArrowLeft size={24} className="text-zikoroGray" weight="bold" />
        </button>

        <Dialog open={isRecipientDialog} onOpenChange={toggleRecipientDialog}>
          <DialogTrigger asChild>
            <button
              className={cn(
                "border rounded-xl flex items-center gap-2 bg-white px-4 py-2 text-sm"
              )}
            >
              <Pencil size={16} className="text-zikoroGray" weight="bold" />
              <span>Edit Profile</span>
            </button>
          </DialogTrigger>
          <DialogContent className="px-4 py-6 max-h-[90vh] overflow-auto">
            <AddRecipientForm
              directoryAlias={directory?.directoryAlias}
              onClose={() => {
                toggleRecipientDialog(false);
              }}
            />
          </DialogContent>
        </Dialog>
      </section>

      <section className="space-y-4 w-1/2">
        <Image
          src={DirectoryLogo}
          alt="Directory Logo"
          width={174}
          height={39}
        />
        {isFetching ? (
          <Skeleton className="w-1/2 h-7 rounded-lg" />
        ) : (
          <h1 className="text-xl font-semibold">{directory?.directoryName}</h1>
        )}

        <div className="border rounded-md flex">
          <div className="flex flex-col gap-1 px-2 py-2 border-r">
            <span className="font-semibold">0</span>
            <span className="text-sm text-zikoroGray">
              Total members listed
            </span>
          </div>
          <div className="flex flex-col gap-1 px-2 py-2 border-r">
            <span className="font-semibold">0</span>
            <span className="text-sm text-zikoroGray">
              Total certificates earned
            </span>
          </div>
          <div className="flex flex-col gap-1 px-2 py-2">
            <span className="font-semibold">0</span>
            <span className="text-sm text-red-500">
              Total expired certificates
            </span>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-zikoroBlack">Members</h2>
        <div className="w-1/2">
          <Input
            placeholder="Search member name"
            className="border-none !border-b"
          />
        </div>
        {isFetching || recipientsIsFetching ? (
          <div>Loading...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
            {recipients.length > 0 ? (
              recipients.map((recipient) => (
                <DirectoryRecipient key={recipient.id} recipient={recipient} />
              ))
            ) : (
              <div className="flex flex-col justify-center items-center gap-4 p-4">
                <p className="text-zikoroBlack text-xl font-semibold">
                  No members found
                </p>
                <p className="text-zikoroBlack text-sm">
                  Add members to your directory to start issuing credentials
                </p>
                <Dialog
                  open={isRecipientDialog}
                  onOpenChange={toggleRecipientDialog}
                >
                  <DialogTrigger asChild>
                    <button
                      className={cn(
                        "border rounded-xl flex items-center gap-2 bg-white px-4 py-2 text-sm"
                      )}
                    >
                      <Pencil
                        size={16}
                        className="text-zikoroGray"
                        weight="bold"
                      />
                      <span>Edit Profile</span>
                    </button>
                  </DialogTrigger>
                  <DialogContent className="px-4 py-6 max-h-[90vh] overflow-auto">
                    <AddRecipientForm
                      directoryAlias={directory?.directoryAlias}
                      onClose={() => {
                        toggleRecipientDialog(false);
                      }}
                    />
                  </DialogContent>
                </Dialog>
              </div>
            )}
          </div>
        )}
      </section>
    </section>
  );
};

export default Directory;
