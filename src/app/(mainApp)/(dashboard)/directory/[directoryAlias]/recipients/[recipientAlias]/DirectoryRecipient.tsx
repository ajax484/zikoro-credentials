"use client";
import { ArrowLeft } from "@phosphor-icons/react";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import DirectoryLogo from "@/public/icons/DirectoryLogo.svg";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Credentials from "./_components/Credentials";
import Skills from "./_components/Skills";
import Contact from "./_components/Contact";
import { useFetchDirectoryRecipient } from "@/queries/directories.queries";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { is } from "date-fns/locale";
import { Skeleton } from "@/components/ui/skeleton";
import useOrganizationStore from "@/store/globalOrganizationStore";

interface Tabs {
  label: string;
  Component: React.FC;
}

const tabs: Tabs[] = [
  {
    label: "Credentials",
    Component: Credentials,
  },
  {
    label: "Skills",
    Component: Skills,
  },
  {
    label: "Contact",
    Component: Contact,
  },
];

const DirectoryRecipient = ({
  directoryAlias,
  recipientAlias,
}: {
  directoryAlias: string;
  recipientAlias: string;
}) => {
  const { organization } = useOrganizationStore();
  const { data: recipient, isFetching } = useFetchDirectoryRecipient(
    organization?.organizationAlias!,
    directoryAlias,
    recipientAlias
  );

  return (
    <section className="space-y-8">
      <section className="border-b py-4">
        {/* back */}
        <div className="flex gap-2 items-center">
          <Link
            href={"/directory"}
            className="rounded-full border bg-white p-2"
          >
            <ArrowLeft size={24} className="text-zikoroGray" weight="bold" />
          </Link>
          <Image
            src={DirectoryLogo}
            alt="Directory Logo"
            width={174}
            height={39}
          />
        </div>
      </section>

      <section className="">
        <div className="flex flex-col items-center">
          <div className="mb-2">
            {isFetching ? (
              <Skeleton className="rounded-full size-[50px]" />
            ) : (
              <Avatar className="size-12">
                <AvatarImage src={recipient?.profile_picture} />
                <AvatarFallback>
                  {(recipient.first_name[0] || "#") +
                    (recipient.last_name[0] || "#")}
                </AvatarFallback>
              </Avatar>
            )}
          </div>

          <div className="mb-2">
            {isFetching ? (
              <Skeleton className="w-1/4 h-7 rounded-lg" />
            ) : (
              <h1 className="text-xl font-semibold">
                {recipient.first_name + " " + recipient.last_name}
              </h1>
            )}
          </div>

          <div className="text-xs flex gap-0.5 mb-2">
            <span className="text-zikoroGray">Last certified:</span>
            <span>12th, May 2024</span>
          </div>
        </div>
        <Tabs defaultValue="Credentials" className="w-full !p-0 mt-4">
          <TabsList className="bg-transparent border-none !p-0 w-full !flex !h-fit !rounded-none">
            {tabs.map(({ label }) => (
              <TabsTrigger
                key={label}
                value={label}
                className="!font-semibold w-fit px-8 py-2 data-[state=active]:bg-transparent group data-[state=active]:text-zikoroBlack border-b-2 data-[state=active]:border-zikoroBlack flex gap-2 !rounded-none !h-fit focus-visible:!ring-0 focus-visible:!outline-none data-[state=active]:shadow-none"
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{label}</span>
                </div>
              </TabsTrigger>
            ))}
          </TabsList>
          {tabs.map(({ label, Component }) => (
            <TabsContent key={label} value={label} className="p-4">
              <Component />
            </TabsContent>
          ))}
        </Tabs>
      </section>
    </section>
  );
};

export default DirectoryRecipient;
