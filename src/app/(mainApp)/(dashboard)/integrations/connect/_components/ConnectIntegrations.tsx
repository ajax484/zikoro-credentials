"use client";
import React, { useEffect, useState } from "react";
import { Timeline } from "@/components/Timeline/Timeline";
import { useFetchCertificates } from "@/queries/certificates.queries";
import useOrganizationStore from "@/store/globalOrganizationStore";
import {
  CertificateTemplate,
  RecipientEmailTemplate,
  TCertificate,
} from "@/types/certificates";
import useUserStore from "@/store/globalUserStore";
import { useFetchWorkspaces } from "@/queries/Workspaces.queries";
import { TOrganization } from "@/types/organization";
import Connect from "./Connect";
import SelectIntegration from "./SelectIntegration";
import MapRecipients from "./MapRecipients";
import DeliverySettings from "./DeliverySettings";
import EmailTemplate from "./EmailTemplate";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useFetchIntegration } from "@/queries/integrations.queries";
import { CredentialsIntegration } from "@/types/integrations";

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
  template?: RecipientEmailTemplate;
  integration?: Omit<CredentialsIntegration, "certificate" | "template"> | null;
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
    Component: SelectIntegration,
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

const ConnectIntegrations = ({
  integrationAlias,
}: {
  integrationAlias: string;
}) => {
  const { organization, setOrganization } = useOrganizationStore();
  const { user } = useUserStore();
  const [step, setStep] = useState(1);
  const [certificate, setCertificate] = useState<TCertificate | null>(null);
  const [selectedIntegration, selectIntegrationType] = useState<string>("");
  const [workspace, setWorkspace] = useState<TOrganization | null>(
    organization
  );
  const [integratedId, setIntegratedId] = useState<string>("");
  const [schedule, setSchedule] = useState<string>("");
  const [scheduleDate, setScheduleDate] = useState<string | null>(null);
  const [integration, setIntegration] = useState<Omit<
    CredentialsIntegration,
    "certificate" | "template"
  > | null>(null);

  const { data: workspaces, isFetching: workspacesIsLoading } =
    useFetchWorkspaces(user?.userEmail!);
  const { data: certificates, isFetching: certificatesIsLoading } =
    useFetchCertificates(organization?.organizationAlias!);

  const { data: integrationData, isFetching: integrationIsLoading } =
    useFetchIntegration(organization?.organizationAlias!, integrationAlias);

  console.log(integration);

  useEffect(() => {
    if (integrationData && !workspacesIsLoading) {
      setCertificate(integrationData.certificate);
      setSchedule(integrationData.schedule);
      setScheduleDate(integrationData.scheduleDate);
      setIntegratedId(integrationData?.integrationSettings.integratedId!);
      setWorkspace(
        workspaces.find(
          (w) => w.organizationAlias === integrationData.workspaceAlias
        )!
      );
      selectIntegrationType(integrationData.integrationType);

      const { certificate, template, ...rest } = integrationData;
      setIntegration(rest);

      setHeaders(() => {
        const updatedHeaders = new Map();

        Object.entries(integrationData?.integrationSettings.mapping).forEach(
          ([key, value]) => {
            const duplicateKey = Array.from(updatedHeaders.keys()).find(
              (headerKey) => headerKey.value === key
            );

            if (!duplicateKey) {
              if (value === "recipientFirstName") {
                updatedHeaders.set(
                  {
                    label: "First name",
                    value: "recipientFirstName",
                    isRequired: true,
                  },
                  key
                );
              } else if (value === "recipientLastName") {
                updatedHeaders.set(
                  {
                    label: "Last name",
                    value: "recipientLastName",
                    isRequired: true,
                  },
                  key
                );
              } else if (value === "recipientEmail") {
                updatedHeaders.set(
                  {
                    label: "Email",
                    value: "recipientEmail",
                    isRequired: true,
                  },
                  key
                );
              } else {
                updatedHeaders.set(
                  {
                    label: value,
                    value,
                    isRequired: false,
                  },
                  key
                );
              }
            }
          }
        );

        console.log(updatedHeaders);

        return updatedHeaders;
      });
    }
  }, [integrationData, workspacesIsLoading, workspaces]);
  const selectSchedule = (value: string) => {
    setSchedule(value);
  };

  const selectScheduleDate = (value: string) => {
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
    setOrganization(workspace);
  };

  const selectIntegration = (value: string) => {
    selectIntegrationType(value);
    if (value === "event") {
      updateHeader(
        {
          label: "First name",
          value: "recipientFirstName",
          isRequired: true,
        },
        "firstName"
      );
      updateHeader(
        { label: "Last name", value: "recipientLastName", isRequired: true },
        "lastName"
      );
      updateHeader(
        { label: "Email", value: "recipientEmail", isRequired: true },
        "email"
      );
    }

    setStep(1.5);
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

  const router = useRouter();

  return (
    <section className="space-y-4">
      <div className="flex items-center">
        <button onClick={() => router.back()} aria-label="back">
          <ArrowLeft className="text-gray-800 hover:text-basePrimary size-6" />
        </button>
        <h1 className="text-2xl font-bold text-center text-gray-800 mx-auto">
          {steps[step].heading}
        </h1>
      </div>
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

        {integrationIsLoading ||
        workspacesIsLoading ||
        certificatesIsLoading ? (
          <div>Loading...</div>
        ) : (
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
            template={integrationData?.template}
            integration={integration}
          />
        )}
      </section>
    </section>
  );
};

export default ConnectIntegrations;
