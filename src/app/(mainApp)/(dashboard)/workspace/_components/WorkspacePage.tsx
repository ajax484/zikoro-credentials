"use client";
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import WorkspaceInfoIcon from "@/public/icons/ic_twotone-admin-panel-settings (2).svg";
import CreditHistoryIcon from "@/public/icons/ph_coins-duotone.svg";
import TeamMembersIcon from "@/public/icons/ic_twotone-people (1).svg";
import SocialLinksIcon from "@/public/icons/line-md_link.svg";
import WorkspaceInformation from "./tabs/WorkspaceInformation";
import CreditHistory from "./tabs/CreditHistory";
import Image from "next/image";
import TeamMembers from "./tabs/TeamMembers";
import SocialLinks from "./tabs/SocialLinks";
import SelectOrganization from "@/components/SelectOrganization/SelectOrganization";

type Tabs = {
  name: string;
  Icon: string;
  Component: React.FC;
};

const tabs: Tabs[] = [
  {
    name: "Workspace information",
    Icon: WorkspaceInfoIcon,
    Component: WorkspaceInformation,
  },
  {
    name: "Credit history",
    Icon: CreditHistoryIcon,
    Component: CreditHistory,
  },
  {
    name: "Team members",
    Icon: TeamMembersIcon,
    Component: TeamMembers,
  },
  {
    name: "Social Links",
    Icon: SocialLinksIcon,
    Component: SocialLinks,
  },
];

const WorkspacePage = () => {
  return (
    <section className="space-y-4">
      <div className="flex justify-end w-full">
        <SelectOrganization />
      </div>
      <div className="bg-white rounded-lg">
        <Tabs defaultValue="Workspace information" className="w-full !p-0">
          <TabsList className="bg-white border-b-2 !p-0 !px-12 !max-w-full !flex !h-fit !rounded-none !justify-center md:!justify-start">
            {tabs.map(({ name, Icon }) => (
              <TabsTrigger
                key={name}
                value={name}
                className="w-fit px-6 py-2 data-[state=active]:bg-transparent group data-[state=active]:text-gray-900 data-[state=active]:border-b-2 data-[state=active]:border-gray-900 flex gap-2 !rounded-none !h-fit focus-visible:!ring-0 focus-visible:!outline-none data-[state=active]:shadow-none"
              >
                <div className="flex items-center gap-2">
                  <Image src={Icon} alt={name} width={24} height={24} />
                  <span className="text-sm font-medium hidden sm:inline">{name}</span>
                </div>
              </TabsTrigger>
            ))}
          </TabsList>
          {tabs.map(({ name, Component }) => (
            <TabsContent key={name} value={name} className="p-4">
              <Component />
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </section>
  );
};

export default WorkspacePage;
