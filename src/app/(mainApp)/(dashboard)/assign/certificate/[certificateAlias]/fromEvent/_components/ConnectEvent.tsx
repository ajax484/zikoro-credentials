"use client";
import { useGetData } from "@/hooks/services/request";
import React from "react";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { TOrganization } from "@/types/organization";
import useUserStore from "@/store/globalUserStore";
import Image from "next/image";
import logo from "@/public/icons/logo.svg";
import { Event } from "@/types/events";
import { Button } from "@/components/ui/button";

const ConnectEvent = ({
  workspace,
  updateWorkspace,
  selectedEvent,
  updateEvent,
  setStep,
}: {
  workspace: TOrganization | null | undefined;
  updateWorkspace: (workspace: TOrganization) => void;
  selectedEvent: Event | undefined;
  updateEvent: (event: Event) => void;
  setStep: (step: number) => void;
}) => {
  const { user } = useUserStore();
  const { data: workspaces, isLoading: workspacesIsLoading } = useGetData<
    TOrganization[]
  >(`/workspaces?userEmail=${user?.userEmail}`, false, []);

  const { data: events, isLoading: eventsIsLoading } = useGetData<Event[]>(
    `/workspaces/${workspace?.id}/events`,
    
    []
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 w-full items-center">
        <Image
          src={logo}
          width={40}
          height={40}
          alt="logo"
          className="cursor-pointer"
        />
        <p className="text-sm font-bold text-gray-800">
          Connect to Zikoro event to import recipients
        </p>
      </div>
      <div className="flex flex-col gap-2 w-full">
        <label className="font-medium text-gray-700">Workspace</label>
        <Select
          disabled={workspacesIsLoading || eventsIsLoading}
          value={String(workspace?.id)}
          onValueChange={(value) =>
            updateWorkspace(
              workspaces?.find(({ id }) => id === parseInt(value))
            )
          }
        >
          <SelectTrigger className="w-full rounded-md bg-white font-medium">
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
      </div>
      <div className="flex flex-col gap-2 w-full">
        <label className="font-medium text-gray-700">Event</label>
        <Select
          disabled={workspacesIsLoading || eventsIsLoading}
          value={String(selectedEvent?.id)}
          onValueChange={(value) =>
            updateEvent(events?.find(({ id }) => id === parseInt(value)))
          }
        >
          <SelectTrigger className="w-full rounded-md bg-white font-medium">
            <SelectValue placeholder={"Select event"} />
          </SelectTrigger>
          <SelectContent>
            {events?.map(({ id, eventTitle }) => (
              <SelectItem value={String(id)} key={id}>
                {eventTitle}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex justify-center w-full">
        <Button
          onClick={() => setStep(2)}
          disabled={!selectedEvent}
          className="bg-basePrimary text-white"
          type="button"
        >
          Proceed
        </Button>
      </div>
    </div>
  );
};

export default ConnectEvent;
