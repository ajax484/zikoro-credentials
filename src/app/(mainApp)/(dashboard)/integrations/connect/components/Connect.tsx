import React from "react";
import ZikoroForm from "@/public/icons/zikoro form.svg";
import ZikoroQuiz from "@/public/icons/zikoro quiz.svg";
import ZikoroEvents from "@/public/icons/zikoro events.svg";
import File from "@/public/icons/document.svg";
import { IntegrationComponentProps } from "./ConnectIntegrations";
import Image from "next/image";
import GradientText from "@/components/GradientText";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";

interface Option {
  logo: string;
  label: string;
  value: string;
}

const options: Option[] = [
  {
    logo: ZikoroForm,
    label: "Zikoro Form",
    value: "form",
  },
  {
    logo: ZikoroQuiz,
    label: "Zikoro Quiz",
    value: "quiz",
  },
  {
    logo: ZikoroEvents,
    label: "Zikoro Events",
    value: "event",
  },
  {
    logo: File,
    label: "Google Form",
    value: "google form",
  },
];

const Connect: React.FC<IntegrationComponentProps> = ({
  selectIntegration,
  workspaces,
  workspacesIsLoading,
  workspace,
  updateWorkspace,
}) => {
  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-2 w-1/3 mx-auto">
        <label className="font-medium text-gray-700 text-sm">Workspace</label>
        <Select
          disabled={workspacesIsLoading}
          value={String(workspace?.id ?? "")}
          onValueChange={(value) => {
            const newWorkspace = workspaces?.find(
              ({ id }) => id === parseInt(value)
            );
            newWorkspace && updateWorkspace(newWorkspace);
          }}
        >
          <SelectTrigger className="w-full rounded-md bg-[#f7f8f9] font-medium">
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
      <div className="flex justify-between gap-4">
        {options.map((option) => (
          <div
            className={cn(
              "rounded-md border p-4 space-y-4 flex-1",
              option.value === "google form" && "opacity-50"
            )}
          >
            <div className="flex justify-between items-center">
              {option.value === "google form" ? (
                <svg
                  width={32}
                  height={40}
                  viewBox="0 0 32 45"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <mask
                    id="mask0_2084_5807"
                    style={{ maskType: "luminance" }}
                    maskUnits="userSpaceOnUse"
                    x={0}
                    y={0}
                    width={32}
                    height={45}
                  >
                    <path
                      d="M19.9999 0.489258H3.00036C2.20527 0.491399 1.44336 0.808195 0.88115 1.37041C0.318937 1.93262 0.00214118 2.69453 0 3.48962L0 41.4897C0.00231951 42.2846 0.319194 43.0464 0.881388 43.6084C1.44358 44.1705 2.20539 44.4872 3.00036 44.4893H29.0003C29.7952 44.487 30.5568 44.1702 31.1189 43.6082C31.6809 43.0461 31.9977 42.2845 32 41.4897V12.4893L19.9999 0.489258Z"
                      fill="white"
                    />
                  </mask>
                  <g mask="url(#mask0_2084_5807)">
                    <path
                      d="M19.9999 0.489258H3.00036C2.20527 0.491399 1.44336 0.808195 0.88115 1.37041C0.318937 1.93262 0.00214118 2.69453 0 3.48962L0 41.4897C0.00231951 42.2846 0.319194 43.0464 0.881388 43.6084C1.44358 44.1705 2.20539 44.4872 3.00036 44.4893H29.0003C29.7952 44.487 30.5568 44.1702 31.1189 43.6082C31.6809 43.0461 31.9977 42.2845 32 41.4897V12.4893L25.0007 7.48919L19.9999 0.489258Z"
                      fill="#673AB7"
                    />
                  </g>
                  <mask
                    id="mask1_2084_5807"
                    style={{ maskType: "luminance" }}
                    maskUnits="userSpaceOnUse"
                    x={0}
                    y={0}
                    width={32}
                    height={45}
                  >
                    <path
                      d="M19.9999 0.489258H3.00036C2.20527 0.491399 1.44336 0.808195 0.88115 1.37041C0.318937 1.93262 0.00214118 2.69453 0 3.48962L0 41.4897C0.00231951 42.2846 0.319194 43.0464 0.881388 43.6084C1.44358 44.1705 2.20539 44.4872 3.00036 44.4893H29.0003C29.7952 44.487 30.5568 44.1702 31.1189 43.6082C31.6809 43.0461 31.9977 42.2845 32 41.4897V12.4893L19.9999 0.489258Z"
                      fill="white"
                    />
                  </mask>
                  <g mask="url(#mask1_2084_5807)">
                    <path
                      d="M13.0001 34.4893H23.9996V32.4889H13.0001V34.4893ZM13.0001 22.4892V24.489H23.9996V22.4892H13.0001ZM10.4987 23.4885C10.4985 23.8863 10.3404 24.2677 10.0591 24.549C9.77782 24.8303 9.39634 24.9885 8.99853 24.9886C8.60071 24.9883 8.21931 24.83 7.93814 24.5486C7.65696 24.2671 7.49902 23.8856 7.49902 23.4878C7.49938 23.0901 7.65757 22.7088 7.93885 22.4276C8.22013 22.1465 8.6015 21.9885 8.9992 21.9883C9.3969 21.9886 9.7782 22.1468 10.0594 22.4281C10.3405 22.7094 10.4985 23.0908 10.4987 23.4885ZM10.4987 28.4886C10.4983 28.8863 10.3402 29.2676 10.0589 29.5488C9.7776 29.8299 9.39623 29.9879 8.99853 29.9881C8.60094 29.9878 8.21975 29.8297 7.93861 29.5485C7.65748 29.2674 7.49938 28.8862 7.49902 28.4886C7.49902 28.0907 7.65706 27.709 7.93837 27.4276C8.21969 27.1461 8.60127 26.9879 8.9992 26.9878C9.39702 26.9881 9.77842 27.1464 10.0596 27.4278C10.3408 27.7092 10.4987 28.0908 10.4987 28.4886ZM10.4987 33.4881C10.4987 33.886 10.3407 34.2677 10.0594 34.5491C9.77804 34.8306 9.39646 34.9888 8.99853 34.9889C8.60071 34.9886 8.21931 34.8303 7.93814 34.5489C7.65696 34.2674 7.49902 33.8859 7.49902 33.4881C7.49938 33.0904 7.65757 32.7091 7.93885 32.4279C8.22013 32.1468 8.6015 31.9888 8.9992 31.9886C9.39679 31.9889 9.77798 32.147 10.0591 32.4282C10.3403 32.7093 10.4983 33.0905 10.4987 33.4881ZM12.9988 29.4885H23.9996V27.488H13.0001L12.9988 29.4885Z"
                      fill="#F1F1F1"
                    />
                  </g>
                  <mask
                    id="mask2_2084_5807"
                    style={{ maskType: "luminance" }}
                    maskUnits="userSpaceOnUse"
                    x={0}
                    y={0}
                    width={32}
                    height={45}
                  >
                    <path
                      d="M19.9999 0.489258H3.00036C2.20527 0.491399 1.44336 0.808195 0.88115 1.37041C0.318937 1.93262 0.00214118 2.69453 0 3.48962L0 41.4897C0.00231951 42.2846 0.319194 43.0464 0.881388 43.6084C1.44358 44.1705 2.20539 44.4872 3.00036 44.4893H29.0003C29.7952 44.487 30.5568 44.1702 31.1189 43.6082C31.6809 43.0461 31.9977 42.2845 32 41.4897V12.4893L19.9999 0.489258Z"
                      fill="white"
                    />
                  </mask>
                  <g mask="url(#mask2_2084_5807)">
                    <path
                      d="M20.877 11.6123L31.9995 22.7322V12.4898L20.877 11.6123Z"
                      fill="url(#paint0_linear_2084_5807)"
                    />
                  </g>
                  <mask
                    id="mask3_2084_5807"
                    style={{ maskType: "luminance" }}
                    maskUnits="userSpaceOnUse"
                    x={0}
                    y={0}
                    width={32}
                    height={45}
                  >
                    <path
                      d="M19.9999 0.489258H3.00036C2.20527 0.491399 1.44336 0.808195 0.88115 1.37041C0.318937 1.93262 0.00214118 2.69453 0 3.48962L0 41.4897C0.00231951 42.2846 0.319194 43.0464 0.881388 43.6084C1.44358 44.1705 2.20539 44.4872 3.00036 44.4893H29.0003C29.7952 44.487 30.5568 44.1702 31.1189 43.6082C31.6809 43.0461 31.9977 42.2845 32 41.4897V12.4893L19.9999 0.489258Z"
                      fill="white"
                    />
                  </mask>
                  <g mask="url(#mask3_2084_5807)">
                    <path
                      d="M20 0.489258V9.48966C19.9999 9.88367 20.0775 10.2738 20.2282 10.6378C20.379 11.0019 20.6 11.3326 20.8786 11.6112C21.1573 11.8898 21.4881 12.1107 21.8521 12.2614C22.2162 12.4121 22.6064 12.4895 23.0004 12.4893H32.0001L20 0.489258Z"
                      fill="#B39DDB"
                    />
                  </g>
                  <mask
                    id="mask4_2084_5807"
                    style={{ maskType: "luminance" }}
                    maskUnits="userSpaceOnUse"
                    x={0}
                    y={0}
                    width={32}
                    height={45}
                  >
                    <path
                      d="M19.9999 0.489258H3.00036C2.20527 0.491399 1.44336 0.808195 0.88115 1.37041C0.318937 1.93262 0.00214118 2.69453 0 3.48962L0 41.4897C0.00231951 42.2846 0.319194 43.0464 0.881388 43.6084C1.44358 44.1705 2.20539 44.4872 3.00036 44.4893H29.0003C29.7952 44.487 30.5568 44.1702 31.1189 43.6082C31.6809 43.0461 31.9977 42.2845 32 41.4897V12.4893L19.9999 0.489258Z"
                      fill="white"
                    />
                  </mask>
                  <g mask="url(#mask4_2084_5807)">
                    <path
                      d="M3.00036 0.489258C2.20527 0.491399 1.44336 0.808195 0.88115 1.37041C0.318937 1.93262 0.00214118 2.69453 0 3.48962L0 3.73976C0.00214118 2.94467 0.318937 2.18276 0.88115 1.62055C1.44336 1.05834 2.20527 0.741542 3.00036 0.7394H19.9999V0.489258H3.00036Z"
                      fill="white"
                      fillOpacity="0.2"
                    />
                  </g>
                  <mask
                    id="mask5_2084_5807"
                    style={{ maskType: "luminance" }}
                    maskUnits="userSpaceOnUse"
                    x={0}
                    y={0}
                    width={32}
                    height={45}
                  >
                    <path
                      d="M19.9999 0.489258H3.00036C2.20527 0.491399 1.44336 0.808195 0.88115 1.37041C0.318937 1.93262 0.00214118 2.69453 0 3.48962L0 41.4897C0.00231951 42.2846 0.319194 43.0464 0.881388 43.6084C1.44358 44.1705 2.20539 44.4872 3.00036 44.4893H29.0003C29.7952 44.487 30.5568 44.1702 31.1189 43.6082C31.6809 43.0461 31.9977 42.2845 32 41.4897V12.4893L19.9999 0.489258Z"
                      fill="white"
                    />
                  </mask>
                  <g mask="url(#mask5_2084_5807)">
                    <path
                      d="M29.0003 44.2406H3.00036C2.20527 44.2384 1.44336 43.9217 0.88115 43.3594C0.318937 42.7972 0.00214118 42.0353 0 41.2402L0 41.4904C0.00231951 42.2853 0.319194 43.0471 0.881388 43.6091C1.44358 44.1712 2.20539 44.4879 3.00036 44.4901H29.0003C29.7952 44.4877 30.5568 44.171 31.1189 43.6089C31.6809 43.0469 31.9977 42.2852 32 41.4904V41.2402C31.9979 42.0352 31.6812 42.797 31.1191 43.3592C30.557 43.9214 29.7953 44.2383 29.0003 44.2406Z"
                      fill="#311B92"
                      fillOpacity="0.2"
                    />
                  </g>
                  <mask
                    id="mask6_2084_5807"
                    style={{ maskType: "luminance" }}
                    maskUnits="userSpaceOnUse"
                    x={0}
                    y={0}
                    width={32}
                    height={45}
                  >
                    <path
                      d="M19.9999 0.489258H3.00036C2.20527 0.491399 1.44336 0.808195 0.88115 1.37041C0.318937 1.93262 0.00214118 2.69453 0 3.48962L0 41.4897C0.00231951 42.2846 0.319194 43.0464 0.881388 43.6084C1.44358 44.1705 2.20539 44.4872 3.00036 44.4893H29.0003C29.7952 44.487 30.5568 44.1702 31.1189 43.6082C31.6809 43.0461 31.9977 42.2845 32 41.4897V12.4893L19.9999 0.489258Z"
                      fill="white"
                    />
                  </mask>
                  <g mask="url(#mask6_2084_5807)">
                    <path
                      d="M22.9997 12.4899C22.6057 12.49 22.2156 12.4125 21.8516 12.2618C21.4877 12.111 21.157 11.8901 20.8784 11.6115C20.5998 11.333 20.3789 11.0022 20.2282 10.6383C20.0774 10.2743 19.9999 9.88418 20 9.49023V9.74038C19.9999 10.1344 20.0775 10.5245 20.2282 10.8886C20.379 11.2526 20.6 11.5833 20.8786 11.8619C21.1573 12.1405 21.4881 12.3614 21.8521 12.5121C22.2162 12.6628 22.6064 12.7402 23.0004 12.7401H32.0001V12.4899H22.9997Z"
                      fill="#311B92"
                      fillOpacity="0.1"
                    />
                  </g>
                  <path
                    d="M19.9999 0.489258H3.00036C2.20527 0.491399 1.44336 0.808195 0.88115 1.37041C0.318937 1.93262 0.00214118 2.69453 0 3.48962L0 41.4897C0.00231951 42.2846 0.319194 43.0464 0.881388 43.6084C1.44358 44.1705 2.20539 44.4872 3.00036 44.4893H29.0003C29.7952 44.487 30.5568 44.1702 31.1189 43.6082C31.6809 43.0461 31.9977 42.2845 32 41.4897V12.4893L19.9999 0.489258Z"
                    fill="url(#paint1_radial_2084_5807)"
                  />
                  <defs>
                    <linearGradient
                      id="paint0_linear_2084_5807"
                      x1="577.06"
                      y1="107.087"
                      x2="577.06"
                      y2="1123.75"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop stopColor="#311B92" stopOpacity="0.2" />
                      <stop offset={1} stopColor="#311B92" stopOpacity="0.02" />
                    </linearGradient>
                    <radialGradient
                      id="paint1_radial_2084_5807"
                      cx={0}
                      cy={0}
                      r={1}
                      gradientUnits="userSpaceOnUse"
                      gradientTransform="translate(101.376 87.4379) scale(5159.97 5159.96)"
                    >
                      <stop stopColor="white" stopOpacity="0.1" />
                      <stop offset={1} stopColor="white" stopOpacity={0} />
                    </radialGradient>
                  </defs>
                </svg>
              ) : (
                <Image
                  alt={option.label}
                  src={option.logo}
                  height={40}
                  width={100}
                />
              )}
              {(option.value === "form" || option.value === "quiz") && (
                <div className="text-xs px-1 py-0.5 border-basePrimary border capitalize rounded-md">
                  <GradientText Tag={"span"}>{option.value}</GradientText>
                </div>
              )}
            </div>
            <p className="font-medium text-gray-700 text-sm">
              Connect your credential to a <b>{option.label}</b>
            </p>
            <div className="flex items-center justify-end">
              <Button
                disabled={
                  option.value === "google form" ||
                  workspacesIsLoading ||
                  !workspace
                }
                onClick={() => selectIntegration(option.value)}
                size={"sm"}
              >
                {option.value === "google form" ? "coming soon" : "Connect"}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Connect;
