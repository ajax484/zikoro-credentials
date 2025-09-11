"use client";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import ViewAttendeesSection, {
  TAttendee,
  ValueType,
} from "@/components/viewAttendeesSection";
import { useGetData } from "@/hooks/services/request";
import {
  useFetchDirectory,
  useFetchDirectoryRecipients,
} from "@/queries/directories.queries";
import useOrganizationStore from "@/store/globalOrganizationStore";
import { useRecipientsStore } from "@/store/globalRecipientsStore";
import { DirectoryRecipient } from "@/types/directories";
import { Event } from "@/types/events";
import { X } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

const FromDirectory = ({ certificateAlias }: { certificateAlias: string }) => {
  const router = useRouter();

  const { organization } = useOrganizationStore();

  const { data: directory, isFetching: directoryIsLoading } = useFetchDirectory(
    organization?.organizationAlias!
  );

  const [searchTerm, setSearchTerm] = useState<string>("");

  const { data: recipients, isFetching: recipientsIsLoading } =
    useFetchDirectoryRecipients(
      organization?.organizationAlias!,
      directory?.directoryAlias!,
      { page: 1, limit: null },
      searchTerm
    );

  const { setRecipients } = useRecipientsStore();

  const submitRecipients = () => {
    console.log(selectedRecipients);
    setRecipients(
      selectedRecipients.map((recipient) => ({
        recipientFirstName: recipient.first_name,
        recipientLastName: recipient.last_name,
        recipientEmail: recipient.email,
        profilePicture:
          recipient.profile_picture ||
          "https://res.cloudinary.com/zikoro/image/upload/v1734007655/ZIKORO/image_placeholder_j25mn4.jpg",
        recipientAlias: recipient.recipientAlias,
      }))
    );
    router.push(`/designs/${certificateAlias}/assign/issue?from=fromEvent`);
  };

  const [selectedRecipients, setSelectedRecipients] = useState<
    DirectoryRecipient[]
  >([]);

  console.log(selectedRecipients);

  if (directoryIsLoading) return <div>Loading...</div>;

  return (
    <div className="space-y-4 md:space-y-6 w-4/5 md:w-1/2 mx-auto mt-32 ">
      <div className="space-y-4">
        <div className="space-y-4">
          <div className="relative">
            <svg
              className="absolute left-2 top-[25%]"
              xmlns="http://www.w3.org/2000/svg"
              width={18}
              height={18}
              viewBox="0 0 18 18"
              fill="none"
            >
              <path
                d="M16.5 16.5L11.5 11.5M1.5 7.33333C1.5 8.09938 1.65088 8.85792 1.94404 9.56565C2.23719 10.2734 2.66687 10.9164 3.20854 11.4581C3.75022 11.9998 4.39328 12.4295 5.10101 12.7226C5.80875 13.0158 6.56729 13.1667 7.33333 13.1667C8.09938 13.1667 8.85792 13.0158 9.56565 12.7226C10.2734 12.4295 10.9164 11.9998 11.4581 11.4581C11.9998 10.9164 12.4295 10.2734 12.7226 9.56565C13.0158 8.85792 13.1667 8.09938 13.1667 7.33333C13.1667 6.56729 13.0158 5.80875 12.7226 5.10101C12.4295 4.39328 11.9998 3.75022 11.4581 3.20854C10.9164 2.66687 10.2734 2.23719 9.56565 1.94404C8.85792 1.65088 8.09938 1.5 7.33333 1.5C6.56729 1.5 5.80875 1.65088 5.10101 1.94404C4.39328 2.23719 3.75022 2.66687 3.20854 3.20854C2.66687 3.75022 2.23719 4.39328 1.94404 5.10101C1.65088 5.80875 1.5 6.56729 1.5 7.33333Z"
                stroke="#717171"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <Input
              type="text"
              placeholder="Search recipients"
              onInput={(event) => setSearchTerm(event.currentTarget.value)}
              value={searchTerm}
              className="placeholder:text-sm placeholder:text-gray-200 text-gray-700 bg-gray-50 rounded-2xl pl-8"
            />
            <svg
              className="absolute right-2 top-[25%]"
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
            >
              <path
                d="M21 3.75V7.5C21 7.69891 20.921 7.88968 20.7803 8.03033C20.6397 8.17098 20.4489 8.25 20.25 8.25C20.0511 8.25 19.8603 8.17098 19.7197 8.03033C19.579 7.88968 19.5 7.69891 19.5 7.5V4.5H16.5C16.3011 4.5 16.1103 4.42098 15.9697 4.28033C15.829 4.13968 15.75 3.94891 15.75 3.75C15.75 3.55109 15.829 3.36032 15.9697 3.21967C16.1103 3.07902 16.3011 3 16.5 3H20.25C20.4489 3 20.6397 3.07902 20.7803 3.21967C20.921 3.36032 21 3.55109 21 3.75ZM7.5 19.5H4.5V16.5C4.5 16.3011 4.42098 16.1103 4.28033 15.9697C4.13968 15.829 3.94891 15.75 3.75 15.75C3.55109 15.75 3.36032 15.829 3.21967 15.9697C3.07902 16.1103 3 16.3011 3 16.5V20.25C3 20.4489 3.07902 20.6397 3.21967 20.7803C3.36032 20.921 3.55109 21 3.75 21H7.5C7.69891 21 7.88968 20.921 8.03033 20.7803C8.17098 20.6397 8.25 20.4489 8.25 20.25C8.25 20.0511 8.17098 19.8603 8.03033 19.7197C7.88968 19.579 7.69891 19.5 7.5 19.5ZM20.25 15.75C20.0511 15.75 19.8603 15.829 19.7197 15.9697C19.579 16.1103 19.5 16.3011 19.5 16.5V19.5H16.5C16.3011 19.5 16.1103 19.579 15.9697 19.7197C15.829 19.8603 15.75 20.0511 15.75 20.25C15.75 20.4489 15.829 20.6397 15.9697 20.7803C16.1103 20.921 16.3011 21 16.5 21H20.25C20.4489 21 20.6397 20.921 20.7803 20.7803C20.921 20.6397 21 20.4489 21 20.25V16.5C21 16.3011 20.921 16.1103 20.7803 15.9697C20.6397 15.829 20.4489 15.75 20.25 15.75ZM3.75 8.25C3.94891 8.25 4.13968 8.17098 4.28033 8.03033C4.42098 7.88968 4.5 7.69891 4.5 7.5V4.5H7.5C7.69891 4.5 7.88968 4.42098 8.03033 4.28033C8.17098 4.13968 8.25 3.94891 8.25 3.75C8.25 3.55109 8.17098 3.36032 8.03033 3.21967C7.88968 3.07902 7.69891 3 7.5 3H3.75C3.55109 3 3.36032 3.07902 3.21967 3.21967C3.07902 3.36032 3 3.55109 3 3.75V7.5C3 7.69891 3.07902 7.88968 3.21967 8.03033C3.36032 8.17098 3.55109 8.25 3.75 8.25ZM15.75 17.25H8.25C7.85218 17.25 7.47064 17.092 7.18934 16.8107C6.90804 16.5294 6.75 16.1478 6.75 15.75V8.25C6.75 7.85218 6.90804 7.47064 7.18934 7.18934C7.47064 6.90804 7.85218 6.75 8.25 6.75H15.75C16.1478 6.75 16.5294 6.90804 16.8107 7.18934C17.092 7.47064 17.25 7.85218 17.25 8.25V15.75C17.25 16.1478 17.092 16.5294 16.8107 16.8107C16.5294 17.092 16.1478 17.25 15.75 17.25ZM8.25 15.75H15.75V8.25H8.25V15.75Z"
                fill="#717171"
              />
            </svg>
          </div>
        </div>
        <div className="space-y-8">
          <div className="flex items-center space-x-2">
            <Checkbox
              className="data-[state=checked]:bg-basePrimary"
              id="all"
              onCheckedChange={() =>
                setSelectedRecipients(
                  selectedRecipients.length === 0 ? recipients.data : []
                )
              }
              checked={recipients.data.every((recipient) =>
                selectedRecipients.includes(recipient)
              )}
            />
            <label
              htmlFor="all"
              className="text-gray-500 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              <p className="text-xs text-gray-500">
                {recipients.data.length} attendees listed in your view
              </p>
            </label>
          </div>
          {selectedRecipients.length > 0 && (
            <div className="max-w-full flex flex-nowrap overflow-x-auto no-scrollbar gap-2">
              {selectedRecipients.map((selectedRecipient) => (
                <div className="rounded-md border bg-white p-2 flex gap-2 text-xs text-zikoroGray font-semibold items-center">
                  <span>
                    {selectedRecipient.first_name} {selectedRecipient.last_name}
                  </span>
                  <button
                    aria-label="delete"
                    type="button"
                    onClick={() =>
                      setSelectedRecipients(
                        selectedRecipients.filter(
                          (recipient) =>
                            recipient.recipientAlias !==
                            selectedRecipient.recipientAlias
                        )
                      )
                    }
                  >
                    <X size={12} className="text-red-600" weight="bold" />
                  </button>
                </div>
              ))}
            </div>
          )}
          <div className="space-y-4">
            {!recipientsIsLoading ? (
              <>
                {recipients.data.map((recipient) => (
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      className="data-[state=checked]:bg-basePrimary"
                      id={recipient.recipientAlias}
                      onCheckedChange={() =>
                        selectedRecipients.includes(recipient)
                          ? setSelectedRecipients(
                              selectedRecipients.filter(
                                (recipient) =>
                                  recipient.recipientAlias !==
                                  recipient.recipientAlias
                              )
                            )
                          : setSelectedRecipients((prev) => [
                              ...prev,
                              recipient,
                            ])
                      }
                      checked={selectedRecipients.includes(recipient)}
                    />
                    <label
                      htmlFor={recipient.recipientAlias}
                      className="capitalize text-gray-500 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {recipient.first_name + " " + recipient.last_name}
                    </label>
                  </div>
                ))}
              </>
            ) : (
              <div>Loading...</div>
            )}
          </div>
        </div>
      </div>
      <div className="flex justify-center w-full">
        <Button
          //   onClick={() => setStep(2)}
          disabled={directoryIsLoading || recipientsIsLoading}
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

export default FromDirectory;
