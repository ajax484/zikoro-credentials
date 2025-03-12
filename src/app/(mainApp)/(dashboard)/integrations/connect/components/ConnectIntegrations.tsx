"use client";
import React, { useEffect, useMemo, useState } from "react";
import Connect from "./Connect";
import MapRecipients from "./MapRecipients";
import DeliverySettings from "./DeliverySettings";
import EmailTemplate from "./EmailTemplate";
import { Timeline } from "@/components/Timeline/Timeline";
import { useFetchCertificates } from "@/queries/certificates.queries";
import useOrganizationStore from "@/store/globalOrganizationStore";
import { TCertificate } from "@/types/certificates";
import SelectForm from "./SelectForm";
import useUserStore from "@/store/globalUserStore";
import { useFetchWorkspaces } from "@/queries/Workspaces.queries";
import { TOrganization } from "@/types/organization";

export interface IntegrationComponentProps {
  selectedIntegration: string;
  selectIntegration: (value: string) => void;
  step: number;
  setStep: (step: number) => void;
  certificates: TCertificate[];
  certificatesIsLoading: boolean;
  certificate: TCertificate | null;
  setCertificate: (certificate: TCertificate | null) => void;
  workspaces: TOrganization[];
  workspacesIsLoading: boolean;
  workspace: TOrganization | null;
  updateWorkspace: (workspace: TOrganization) => void;
  integratedId: string;
  selectIntegratedId: (id: string) => void;
  headers: Map<Header, any>;
  updateHeader: (
    key: {
      label: string;
      value: keyof string;
      isRequired: boolean;
    },
    value: string
  ) => void;
  deleteHeader: (key: {
    label: string;
    value: keyof string;
    isRequired: boolean;
  }) => void;
  schedule: string;
  scheduleDate: string | null;
  selectSchedule: (value: string) => void;
  selectScheduleDate: (value: string) => void;
}

export interface Header {
  label: string;
  value: string;
  isRequired: boolean;
}

interface Steps {
  [index: number]: {
    heading: string;
    Component: React.FC<IntegrationComponentProps>;
  };
}

const steps: Steps = {
  1: {
    heading: "Connect",
    Component: Connect,
  },
  1.5: {
    heading: "Connect",
    Component: SelectForm,
  },
  2: {
    heading: "Map Recipients",
    Component: MapRecipients,
  },
  3: {
    heading: "Delivery Settings",
    Component: DeliverySettings,
  },
  4: {
    heading: "Email Template",
    Component: EmailTemplate,
  },
};

const ConnectIntegrations = () => {
  const { organization } = useOrganizationStore();
  const { user } = useUserStore();
  const [step, setStep] = useState(1);
  const [certificate, setCertificate] = useState<TCertificate | null>(null);
  const [selectedIntegration, setIntegration] = useState<string>("");
  const [workspace, setWorkspace] = useState<TOrganization | null>(
    organization
  );
  const [integratedId, setIntegratedId] = useState<string>("");
  const [schedule, setSchedule] = useState<string>("");
  const [scheduleDate, setScheduleDate] = useState<string | null>(null);

  const selectSchedule = (value: string) => {
    setSchedule(value);
  };

  const selectScheduleDate = (value: Date) => {
    setScheduleDate(value);
  };

  const [headers, setHeaders] = useState<Map<Header, any>>(
    new Map([
      [
        { label: "First name", value: "recipientFirstName", isRequired: true },
        null,
      ],
      [
        { label: "Last name", value: "recipientLastName", isRequired: true },
        null,
      ],
      [{ label: "Email", value: "recipientEmail", isRequired: true }, null],
    ])
  );

  // use effect to set headers to certificate attributes
  useEffect(() => {
    if (!certificate) return;
    setHeaders((prevHeaders) => {
      const updatedHeaders = new Map(prevHeaders);

      certificate?.attributes?.forEach((attribute) => {
        const duplicateKey = Array.from(updatedHeaders.keys()).find(
          (key) => key.label === attribute || key.value === attribute
        );

        if (!duplicateKey) {
          updatedHeaders.set(
            { label: attribute, value: attribute, isRequired: false },
            "N/A"
          );
        }
      });

      console.log(updatedHeaders);

      return updatedHeaders;
    });
  }, [certificate]);

  const selectIntegratedId = (id: string) => {
    setIntegratedId(id);
  };

  const updateWorkspace = (workspace: TOrganization | null) => {
    setWorkspace(workspace);
  };

  const { data: workspaces, isFetching: workspacesIsLoading } =
    useFetchWorkspaces(user?.userEmail!);
  const { data: certificates, isFetching: certificatesIsLoading } =
    useFetchCertificates(organization?.organizationAlias!);

  const selectIntegration = (value: string) => {
    setIntegration(value);
    if (value === "event") {
      setStep(3);
    } else {
      setStep(1.5);
    }
  };

  const Component = steps[step].Component;

  const updateHeader = (
    key: {
      label: string;
      value: string;
      isRequired: boolean;
    },
    value: string
  ) => {
    setHeaders((prevHeaders) => {
      prevHeaders.set(key, value);
      return prevHeaders;
    });
  };

  const deleteHeader = (key: {
    label: string;
    value: keyof string;
    isRequired: boolean;
  }) => {
    console.log(key, "key");
    setHeaders((prevHeaders) => {
      prevHeaders.delete(key);
      return prevHeaders;
    });
  };

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-bold text-center text-gray-800">
        {steps[step].heading}
      </h1>
      <section className="bg-white border rounded-md p-4 min-h-[500px] space-y-6">
        <Timeline
          steps={[
            "connect",
            "map recipients",
            "delivery settings",
            "email template",
          ]}
          step={step}
          setStep={setStep}
        />

        <Component
          selectedIntegration={selectedIntegration}
          selectIntegration={selectIntegration}
          step={step}
          setStep={setStep}
          certificates={certificates}
          certificatesIsLoading={certificatesIsLoading}
          certificate={certificate}
          setCertificate={setCertificate}
          workspaces={workspaces}
          workspacesIsLoading={workspacesIsLoading}
          workspace={workspace}
          updateWorkspace={updateWorkspace}
          integratedId={integratedId}
          selectIntegratedId={selectIntegratedId}
          headers={headers}
          updateHeader={updateHeader}
          deleteHeader={deleteHeader}
          schedule={schedule}
          scheduleDate={scheduleDate}
          selectSchedule={selectSchedule}
          selectScheduleDate={selectScheduleDate}
        />
      </section>
    </section>
  );
};

export default ConnectIntegrations;
