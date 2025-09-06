"use client";
import { Button } from "@/components/ui/button";
import { useGetData } from "@/hooks/services/request";
import { cn } from "@/lib/utils";
import { TCertificate } from "@/types/certificates";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import ConnectEvent from "./ConnectEvent";
import { Event } from "@/types/events";
import useOrganizationStore from "@/store/globalOrganizationStore";
import { TOrganization } from "@/types/organization";
import SelectAttendee from "./SelectAttendee";
import { Timeline } from "@/components/Timeline/Timeline";

const FromEvent = ({ certificateAlias }: { certificateAlias: string }) => {
  const router = useRouter();
  const { data: certificate, isLoading: certificateIsLoading } =
    useGetData<TCertificate>(`/certificates/${certificateAlias}`, null);

  console.log(certificate, certificateIsLoading);

  const [step, setStep] = useState<number>(1);

  const { organization } = useOrganizationStore();

  const [workspace, setWorkspace] = useState<TOrganization | null | undefined>(
    organization
  );

  const [selectedEvent, setEvent] = useState<Event | undefined>();

  const updateOrganization = (organization: TOrganization) => {
    setWorkspace(organization);
    setEvent(undefined);
  };

  const updateEvent = (selectedEvent: Event) => {
    setEvent(selectedEvent);
  };

  if (certificateIsLoading) return <div>Loading...</div>;
  return (
    <section className="space-y-12">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl capitalize font-semibold text-gray-800">
          Send <b>{certificate?.name}</b> to recipients
        </h1>
        <Button
          onClick={() => router.push(`/designs`)}
          className="bg-basePrimary text-white"
          type="button"
        >
          Back
        </Button>
      </div>
      <section className="flex flex-col items-center pt-12 w-full py-8 mx-auto gap-6 space-y-12">
        <Timeline
          steps={[
              "Connect event",
              "Select attendees",
          ]}
        step={step} setStep={(step) => setStep(step)} />
        {step === 1 && (
          <ConnectEvent
            workspace={workspace}
            updateWorkspace={updateOrganization}
            selectedEvent={selectedEvent}
            updateEvent={updateEvent}
            setStep={setStep}
          />
        )}
        {step === 2 && (
          <SelectAttendee
            selectedEvent={selectedEvent}
            certificateAlias={certificateAlias}
          />
        )}
      </section>
    </section>
  );
};

export default FromEvent;
