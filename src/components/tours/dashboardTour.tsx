import { Tour, useNextStep } from "nextstepjs";
import Image, { StaticImageData } from "next/image";
import CheckCircle from "@/public/icons/CheckCircle.svg";
import FirstStep from "@/public/images/first_step.gif";
import SecondStep from "@/public/images/second_step.gif";
import ThirdStep from "@/public/images/third_step.gif";
import FourthStep from "@/public/images/fourth_step.gif";
import FifthStep from "@/public/images/fifth_step.gif";
import SixthStep from "@/public/images/sixth_step.gif";

const StepContent = ({
  image,
  title,
  content,
  lastStep,
}: {
  image: StaticImageData;
  title: string;
  content: string[];
  lastStep?: boolean;
}) => {
  return (
    <>
      {/* Directly use the image import */}
      <Image
        src={image}
        alt={title}
        width={500}
        height={250}
        className="w-full object-cover"
      />
      <div className="flex flex-col p-4 gap-4">
        <h1 className="font-bold text-gray-800">{title}</h1>
        <ul className="space-y-2">
          {content.map((item, index) => (
            <li key={index} className="flex items-center gap-1">
              <Image src={CheckCircle} alt={title} width={24} height={24} />
              <span className="text-gray-600">{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
};

export const dashboardTourSteps: Tour = {
  tour: "dashboardTour",
  steps: [
    {
      icon: "😭",
      title: "Design Credentials Your Way 🎨",
      content: (
        <StepContent
          image={FirstStep}
          title="Design Credentials Your Way 🎨"
          content={[
            "Start from scratch or use a ready-made template to design stunning certificates and badges.",
            "Customize text, colors, logos, and other elements to match your brand.",
            "Effortlessly edit and align elements using intuitive design tools.",
          ]}
        />
      ),
      selector: "#Designs-link",
      side: "right",
    },
    {
      icon: "😭",
      title: "Assign Credentials With Ease 🎓",
      content: (
        <StepContent
          image={SecondStep}
          title="Assign Credentials With Ease 🎓"
          content={[
            "Effortlessly assign certificates and badges to recipients.",
            "Choose between manual entry or bulk upload for a seamless experience.",
            "Manage recipients in one place-- track, update, or resend credentials anytime.",
          ]}
        />
      ),
      selector: "#Assign-link",
      side: "right",
    },
    {
      icon: "😭",
      title: "Track Credential Engagement 📊",
      content: (
        <StepContent
          image={ThirdStep}
          title="Track Credential Engagement 📊"
          content={[
            "Gain insights into how recipients interact with their credentials.",
            "Monitor views, downloads and shares in real-time.",
            "Identify trends and measure the impact of your issued credentials.",
          ]}
        />
      ),
      selector: "#Analytics-link",
      side: "right",
    },
    {
      icon: "😭",
      title: "Save & Reuse Email Templates ✉️",
      content: (
        <StepContent
          image={FourthStep}
          title="Save & Reuse Email Templates ✉️"
          content={[
            "Create custom emal templates for issuing credentials.",
            "Save templates for quick reuse to maintain consistency.",
            "Personalize subject lines, messages, and recipients details effortlessly.",
          ]}
        />
      ),
      selector: "#Templates-link",
      side: "right",
    },
    {
      icon: "😭",
      title: "Automate Credentialing With Integrations 🔗",
      content: (
        <StepContent
          image={FifthStep}
          title="Automate Credentialing With Integrations 🔗"
          content={[
            "Connect with Zikoro Forms, Zikoro Quiz and Zikoro Events for seamless automation.",
            "Automatically issue credentials based on form submissions, quiz completions, or event participation.",
            "Save time and reduce manual work with smart integrations.",
          ]}
        />
      ),
      selector: "#Integrations-link",
      side: "right",
    },
    {
      icon: "😭",
      title: "Manage Your Workspace ⚙️",
      content: (
        <StepContent
          image={SixthStep}
          title="Manage Your Workspace ⚙️"
          content={[
            "Edit workspace settings to match your needs.",
            "Adds and manage team members with different roles and permissions.",
            "Maintain control over your credentialing process in one centralized space.",
          ]}
          lastStep
        />
      ),
      selector: "#Workspace-link",
      side: "right",
    },
  ],
};
