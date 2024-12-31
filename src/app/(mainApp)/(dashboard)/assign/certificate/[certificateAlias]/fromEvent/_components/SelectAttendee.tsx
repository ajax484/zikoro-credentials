import { Button } from "@/components/ui/button";
import ViewAttendeesSection, {
  TAttendee,
  ValueType,
} from "@/components/viewAttendeesSection";
import { useGetData } from "@/hooks/services/request";
import { useRecipientsStore } from "@/store/globalRecipientsStore";
import { Event } from "@/types/events";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

const SelectAttendee = ({
  selectedEvent,
  certificateAlias,
}: {
  selectedEvent: Event | undefined;
  certificateAlias: string;
}) => {
  if (!selectedEvent) return <div>error</div>;

  const router = useRouter();

  const { data: attendees, isLoading: attendeesIsLoading } = useGetData<
    TAttendee[]
  >(
    `workspaces/${selectedEvent.organisationId}/events/${selectedEvent.eventAlias}/attendees`,
    true,
    []
  );

  const { setRecipients } = useRecipientsStore();

  const [selectedAttendees, setSelectedAttendees] = useState<TAttendee[]>([]);

  const toggleValue = (value: ValueType) => {
    const updatedValue = Array.isArray(value)
      ? value
      : value && selectedAttendees.includes(value)
      ? selectedAttendees.filter((item) => item !== value)
      : [...selectedAttendees, value];

    setSelectedAttendees(updatedValue);
  };

  if (attendeesIsLoading) return <div>Loading...</div>;
  console.log(selectedAttendees);

  const submitRecipients = () => {
    console.log(selectedAttendees);
    setRecipients(
      selectedAttendees.map((attendee) => ({
        recipientFirstName: attendee.firstName,
        recipientLastName: attendee.lastName,
        recipientEmail: attendee.email,
      }))
    );
    router.push(
      `/designs/certificate/${certificateAlias}/issue?from=fromEvent`
    );
  };

  return (
    <div className="space-y-6 w-1/2 mx-auto">
      <ViewAttendeesSection
        attendees={attendees || []}
        toggleValue={toggleValue}
        selectedAttendees={selectedAttendees}
      />
      <div className="flex justify-center w-full">
        <Button
          //   onClick={() => setStep(2)}
          disabled={!selectedEvent || attendeesIsLoading}
          className="bg-basePrimary text-white"
          type="button"
          onClick={submitRecipients}
        >
          Proceed
        </Button>
      </div>
    </div>
  );
};

export default SelectAttendee;
