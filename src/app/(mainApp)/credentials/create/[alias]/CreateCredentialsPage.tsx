"use client";
import { Editor } from "@/components/editor/components/editor";
import {
  useGetBadge,
  useGetCertificate,
  useGetEvent,
  useSaveCertificate,
} from "@/hooks";
import React, { useEffect, useState } from "react";
import { useGetData, useMutateData } from "@/hooks/services/request";
import { CredentialsWorkspaceToken } from "@/types/token";
import {
  base64ToFile,
  getPublicCloudinaryId,
  uploadFile,
} from "@/utils/helpers";

const CreateCredentialsPage = ({
  alias,
  workspaceId,
  eventAlias,
  type,
  workspaceAlias,
}: {
  alias: string;
  workspaceId: string;
  eventAlias: string;
  type: "badge" | "certificate";
  workspaceAlias: string;
}) => {
  console.log(alias, workspaceId);
  const credentialFetchFn =
    type === "certificate" ? useGetCertificate : useGetBadge;
  const { data, isLoading } = credentialFetchFn({
    alias,
  });

  const [previewUrl, setUrl] = useState<string>(data?.previewUrl || "");

  const { mutateData: deletePreviousUrl } = useMutateData(
    `/cloudinary/images/${getPublicCloudinaryId(previewUrl)}`,
    true
  );

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
    console.log(url);
    if (previewUrl !== "")
      await deletePreviousUrl({
        payload: {},
      });
    base64ToFile(url, name + ".png");
    const { url: imageUrl, error } = await uploadFile(url, "image");
    if (error) return;
    if (!imageUrl) return;
    const data = await saveCertificate({
      payload: {
        certificateAlias: alias,
        name,
        JSON: values,
        certificateSettings: settings,
        previewUrl: imageUrl,
        attributes,
        hasQRCode,
        lastEdited: new Date().toISOString(),
      },
    });
  };

  // console.log(data);

  const { event, isLoading: eventLoading } = useGetEvent({
    eventId: eventAlias,
    isAlias: true,
  });

  const [name, setName] = useState<string>("Untitled Certificate");

  const [attributes, setAttributes] = useState<string[]>([]);

  const [hasQRCode, setHasQRCode] = useState<boolean>(false);

  const toggleQRCode = (value: boolean) => setHasQRCode(value);

  const [settings, setSettings] = useState({
    skills: [],
    publishOn: new Date(),
  });

  useEffect(() => {
    if (data?.name) {
      setName(data?.name);
    }

    if (data?.previewUrl) {
      setUrl(data?.previewUrl);
    }

    if (data?.hasQRCode) {
      setHasQRCode(data?.hasQRCode);
    }

    if (data?.attributes) {
      setAttributes(data?.attributes);
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

  const {
    data: credits,
    isLoading: creditsIsLoading,
    getData: getCredits,
  } = useGetData<CredentialsWorkspaceToken[]>(
    `/workspaces/${workspaceId}/credits`,
    []
  );

  const { mutateData: chargeCredits, isLoading: isMutating } = useMutateData<{
    amountToCharge: number;
    activityBy: number;
    credentialId: number;
    workspaceId: number;
    tokenId: number;
  }>(`/workspaces/${workspaceAlias}/credits/charge`);

  const creditBalance = {
    bronze: credits
      .filter((v) => v.tokenId === 1)
      .reduce((acc, curr) => acc + curr.creditRemaining, 0),
    silver: credits
      .filter((v) => v.tokenId === 2)
      .reduce((acc, curr) => acc + curr.creditRemaining, 0),
    gold: credits
      .filter((v) => v.tokenId === 3)
      .reduce((acc, curr) => acc + curr.creditRemaining, 0),
  };

  if (isLoading || eventLoading) return <div>Loading...</div>;

  return (
    <>
      <Editor
        initialData={data?.JSON}
        name={name}
        setName={setName}
        workspaceId={workspaceId}
        workspaceAlias={workspaceAlias}
        save={saveCredentialsFn}
        isSaving={saving}
        isError={error}
        event={event}
        settings={settings}
        setSettings={setSettings}
        type={type}
        alias={alias}
        creditBalance={creditBalance}
        getCredits={getCredits}
        creditsIsLoading={creditsIsLoading}
        credentialId={data?.id}
        chargeCredits={chargeCredits}
        isMutating={isMutating}
        attributes={attributes}
        setAttributes={setAttributes}
        toggleQRCode={toggleQRCode}
        hasQRCode={hasQRCode}
      />
    </>
  );
};

export default CreateCredentialsPage;
