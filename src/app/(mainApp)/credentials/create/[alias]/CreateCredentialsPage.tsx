"use client";
import { Editor } from "@/components/editor/components/editor";
import {
  useGetBadge,
  useGetCertificate,
  useGetEvent,
  useSaveCertificate,
} from "@/hooks";
import React, { useEffect, useState } from "react";

const CreateCredentialsPage = ({
  alias,
  workspaceId,
  eventAlias,
  type,
}: {
  alias: string;
  workspaceId: string;
  eventAlias: string;
  type: "badge" | "certificate";
}) => {
  console.log(alias);
  const credentialFetchFn =
    type === "certificate" ? useGetCertificate : useGetBadge;
  const { data, isLoading } = credentialFetchFn({
    alias,
  });

  const {
    saveCertificate,
    isLoading: saving,
    error,
  } = useSaveCertificate({
    certificateAlias: alias,
  });

  const saveCredentialsFn = async (
    values: {
      json: string;
      height: number;
      width: number;
    },
    url: string
  ) => {
    const data = await saveCertificate({
      payload: {
        certificateAlias: alias,
        name,
        JSON: values,
        certificateSettings: settings,
        previewUrl: url,
      },
    });
  };

  console.log(data);

  const { event, isLoading: eventLoading } = useGetEvent({
    eventId: eventAlias,
    isAlias: true,
  });

  const [name, setName] = useState<string>("Untitled Certificate");

  const [settings, setSettings] = useState({
    skills: [],
    publishOn: new Date(),
  });

  //   const {} = useS

  useEffect(() => {
    if (data?.name) {
      setName(data?.name);
    }

    if (data?.certificateSettings) {
      setSettings(data?.certificateSettings);
    } else {
      setSettings({
        skills: [],
        publishOn: event?.endDateTime,
      });
    }
  }, [data]);

  if (isLoading || eventLoading) return <div>Loading...</div>;

  return (
    <Editor
      initialData={data?.JSON}
      name={name}
      setName={setName}
      workspaceId={workspaceId}
      save={saveCredentialsFn}
      isSaving={saving}
      isError={error}
      event={event}
      settings={settings}
      setSettings={setSettings}
      type={type}
    />
  );
};

export default CreateCredentialsPage;
