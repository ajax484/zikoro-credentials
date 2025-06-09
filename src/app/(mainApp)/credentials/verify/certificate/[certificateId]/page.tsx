"use client";
import { formatDateToHumanReadable } from "@/utils/date";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
// import { exportComponentAsPNG } from "react-component-export-image";
import {
  base64ToFile,
  replaceSpecialText,
  replaceURIVariable,
  uploadFile,
} from "@/utils/helpers";
import { toast } from "@/hooks/use-toast";
import { fabric } from "fabric";
import {
  FacebookIcon,
  LinkedinIcon,
  LinkedinShareButton,
  TwitterIcon,
} from "next-share";
import XIcon from "@/public/icons/x-twitter.svg";
import { useEditor } from "@/components/editor/hooks/use-editor";
import { Button } from "@/components/ui/button";
import { useGetData, useMutateData } from "@/hooks/services/request";
import { CertificateRecipient, TCertificate } from "@/types/certificates";
import { TOrganization } from "@/types/organization";
import GradientText from "@/components/GradientText";
import Image from "next/image";
import Link from "next/link";
import { Calendar, Download, Link2, X } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { BsInfoCircle } from "react-icons/bs";
import {
  FacebookLogo,
  InstagramLogo,
  LinkedinLogo,
} from "@phosphor-icons/react";
import { PiLinkedinLogoBold, PiLinkedinLogoDuotone } from "react-icons/pi";

// import { ShareSocial } from "react-share-social";

const CertificateView = ({
  certificate,
  recordShare,
}: {
  certificate: CertificateRecipient & {
    originalCertificate: TCertificate & {
      workspace: TOrganization;
    };
  };
  recordShare: ({ payload }: { payload: { social: string } }) => Promise<void>;
}) => {
  const initialData = certificate?.originalCertificate.JSON;

  const [isShareDropDown, showShareDropDown] = useState(false);

  const canvasRef = useRef(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // console.log(certificate?.originalCertificate, "initialData");
  console.log(certificate, "initialData");

  let newState = JSON.parse(
    replaceURIVariable(
      replaceSpecialText(
        JSON.stringify(certificate?.originalCertificate.JSON?.json || {}),
        {
          asset: certificate.originalCertificate,
          recipient: certificate,
          organization: certificate.originalCertificate.workspace,
        }
      ),
      certificate.certificateId || ""
    )
  );

  // console.log(certificate.originalCertificate.certificateSettings.skills);

  // Find placeholder in newState and replace with profile picture in the string
  newState = String(newState).replaceAll(
    "https://res.cloudinary.com/zikoro/image/upload/v1734007655/ZIKORO/image_placeholder_j25mn4.jpg",
    certificate?.profilePicture?.trim() ||
      "https://res.cloudinary.com/zikoro/image/upload/v1734007655/ZIKORO/image_placeholder_j25mn4.jpg"
  );

  console.log(newState);

  const { init, editor } = useEditor({
    defaultState: newState,
    defaultWidth: initialData?.width ?? 900,
    defaultHeight: initialData?.height ?? 1200,
    toggleQRCode: () => {},
  });

  useEffect(() => {
    const canvas = new fabric.Canvas(canvasRef.current, {
      controlsAboveOverlay: true,
      preserveObjectStacking: true,
    });

    init({
      initialCanvas: canvas,
      initialContainer: containerRef.current!,
    });

    return () => {
      canvas.dispose();
    };
  }, [init]);

  function toggleShareDropDown() {
    showShareDropDown((prev) => !prev);
  }

  useEffect(() => {
    const timeout = setTimeout(() => {
      toggleShareDropDown();
    }, 1500);

    return () => {
      clearTimeout(timeout);
    };
  }, []);

  const shareText = `Excited to share my ${certificate?.originalCertificate.name} certificate with you! Check it out here: ${window.location.href}`;

  const verificationStatus =
    certificate?.originalCertificate?.workspace?.verification &&
    certificate?.originalCertificate?.workspace?.verification?.length > 0 &&
    certificate?.originalCertificate?.workspace?.verification.every(
      (v) => v.status !== "rejected"
    )
      ? certificate?.originalCertificate?.workspace?.verification.some(
          (v) => v.status === "verified"
        )
        ? "verified"
        : "pending"
      : "unverified";

  const [imageSrc, setImageSrc] = useState("");

  const [imageIsLoading, setImageIsLoading] = useState(false);

  const [firstGenerate, setFirstGenerate] = useState(true);

  useEffect(() => {
    const generateImage = async () => {
      setImageIsLoading(true);
      try {
        if (!editor) return;
        if (firstGenerate) {
          setFirstGenerate(false);
          const url = await editor?.loadJsonAsync(newState);
        }

        const url = await editor?.loadJsonAsync(newState);
        console.log(url);
        if (!url) throw new Error("No url");
        setImageSrc(url);
      } catch (error) {
        console.error("Error generating certificate image:", error);
      } finally {
        setImageIsLoading(false);
      }
    };

    if (!imageSrc) {
      generateImage();
    }
  }, [editor, certificate]);

  const generateLinkedInCertUrl = () => {
    if (!certificate || !certificate.originalCertificate) return "";

    const name = encodeURIComponent(certificate.originalCertificate.name);
    const issueYear = new Date(certificate.created_at).getFullYear();
    const issueMonth = new Date(certificate.created_at).getMonth() + 1; // LinkedIn uses 1-based index for months
    const certId = certificate.certificateId;
    const certUrl = encodeURIComponent(window.location.href);
    const organizationName = encodeURIComponent(
      certificate.originalCertificate.event?.organisationName || ""
    );

    return `https://www.linkedin.com/profile/add?startTask=CERTIFICATION_NAME&name=${name}&issueYear=${issueYear}&issueMonth=${issueMonth}&certId=${certId}&certUrl=${certUrl}&organizationName=${organizationName}`;
  };

  return (
    <section className="space-y-6">
      <div className="bg-white py-2 border rounded-lg w-full">
        <div className="flex flex-col gap-y-2 items-center justify-center text-green-600 py-2 border-b-2 text-sm">
          ID: {certificate?.certificateId}
        </div>
        <div
          className="relative h-[500px] md:h-[calc(100%-124px)] w-full hidden"
          ref={containerRef}
        >
          <div className="absolute inset-0 bg-transparent z-50" />
          <canvas ref={canvasRef} />
        </div>

        <div className="relative h-full w-full flex justify-center items-center flex-1 px-4 py-4">
          {imageIsLoading ? (
            <div className="flex items-center justify-center h-[500px] w-full">
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500 border-solid" />
            </div>
          ) : (
            <img
              alt="certificate"
              src={imageSrc}
              style={{ width: "50%" }}
              className="h-auto"
              onError={(e) => {
                console.error("Failed to load certificate image", e);
                e.currentTarget.style.display = "none";
              }}
            />
          )}
          {/* {imageSrc && !imageIsLoading ? (
            <img
              alt="certificate"
              // src={imageSrc}
              src={editor && editor.generateLink(true)}
              style={{ width: "50%" }}
              className="h-auto"
              onError={(e) => {
                console.error("Failed to load certificate image", e);
                e.currentTarget.style.display = "none";
              }}
            />
          ) : (
            <div className="flex items-center justify-center h-[500px] w-full">
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500 border-solid" />
            </div>
          )} */}
        </div>
      </div>
      {certificate?.originalCertificate?.certificateSettings?.description && (
        <div className="bg-white p-4 border rounded-lg w-full h-full space-y-2 flex flex-col items-center gap-4">
          <GradientText className="font-bold" Tag={"h1"}>
            Description
          </GradientText>
          <div
            dangerouslySetInnerHTML={{
              __html: replaceSpecialText(
                certificate?.originalCertificate?.certificateSettings
                  ?.description,
                {
                  recipient: certificate,
                  organization: certificate?.originalCertificate?.workspace,
                }
              ),
            }}
          />
        </div>
      )}
      <section className="grid grid-cols-2 gap-4">
        <div className="bg-white p-4 border rounded-lg w-full h-full space-y-2 flex flex-col items-center gap-2">
          <div className="flex justify-between items-center w-full">
            <GradientText className="font-bold" Tag={"h1"}>
              Issued by
            </GradientText>
            {}
            <div className="flex gap-2 items-center text-green-600">
              <BsInfoCircle className="size-3" />
              <span className="font-medium text-xs">verified organisation</span>
            </div>
          </div>
          <Image
            src={
              certificate?.originalCertificate?.workspace?.organizationLogo ||
              ""
            }
            alt="logo"
            width={100}
            height={50}
          />
          <span className="text-gray-600 font-medium capitalize">
            {certificate?.originalCertificate?.workspace?.organizationName}
          </span>

          <div className="flex items-center justify-center gap-4 text-gray-600">
            {certificate?.originalCertificate?.workspace?.linkedIn && (
              <Link
                href={
                  certificate?.originalCertificate?.workspace?.linkedIn || "#"
                }
                className="bg-[#f7f8f9] p-2 border rounded"
              >
                <LinkedinLogo className="size-4" />
              </Link>
            )}
            {certificate?.originalCertificate?.workspace?.x && (
              <Link
                href={certificate?.originalCertificate?.workspace?.x || "#"}
                className="bg-[#f7f8f9] p-2 border rounded"
              >
                <Image src={XIcon} alt="X" width={16} height={16} />
              </Link>
            )}
            {certificate?.originalCertificate?.workspace?.facebook && (
              <Link
                href={
                  certificate?.originalCertificate?.workspace?.facebook || "#"
                }
                className="bg-[#f7f8f9] p-2 border rounded"
              >
                <FacebookLogo className="size-4" />
              </Link>
            )}
            {certificate?.originalCertificate?.workspace?.instagram && (
              <Link
                href={
                  certificate?.originalCertificate?.workspace?.instagram || "#"
                }
                className="bg-[#f7f8f9] p-2 border rounded"
              >
                <InstagramLogo className="size-4" />
              </Link>
            )}
            {certificate?.originalCertificate?.workspace?.socialLinks &&
              certificate?.originalCertificate?.workspace?.socialLinks.length >
                0 &&
              certificate?.originalCertificate?.workspace?.socialLinks.map(
                (link, index) => (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Link
                          key={index}
                          href={link.url}
                          className="bg-[#f7f8f9] p-2 border rounded"
                        >
                          <Link2 className="size-4" />
                        </Link>
                      </TooltipTrigger>
                      <TooltipContent className="bg-[#F7F8FF] p-2 rounded-lg border border-gray-200 text-gray-700">
                        <p>{link.title}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )
              )}
          </div>

          <GradientText className="text-sm" Tag={"div"}>
            <Link
              href={`mailto:${certificate.originalCertificate.workspace.eventContactEmail}`}
            >
              Contact Issuer
            </Link>
          </GradientText>
        </div>
        <div className="bg-white p-4 border rounded-lg w-full h-full space-y-2 flex flex-col items-center gap-4">
          <GradientText className="font-bold" Tag={"h1"}>
            Issued to
          </GradientText>
          <div className="flex flex-col gap-0.5 items-center">
            <span className="text-gray-800 font-semibold capitalize">
              {certificate.recipientFirstName +
                " " +
                certificate.recipientLastName}
            </span>
            <div className="flex items-center justify-center gap-1 text-xs text-gray-600">
              <Calendar className="size-2" />
              <span>
                Issue Date:{" "}
                {formatDateToHumanReadable(new Date(certificate.created_at))}
              </span>
            </div>
          </div>
          <div className="relative flex gap-4 items-center">
            <Popover>
              <PopoverTrigger asChild>
                <Button className="bg-basePrimary text-white hover:bg-basePrimary/20 py-1 px-2 h-fit">
                  <h3 className="font-medium text-[10px]">Share Credential</h3>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[300px] p-2">
                <ActionModal
                  recordShare={recordShare}
                  close={toggleShareDropDown}
                  url={window.location.href}
                  shareText={shareText}
                />
              </PopoverContent>
            </Popover>
            <Popover>
              <PopoverTrigger>
                <Download className="size-4" />
              </PopoverTrigger>
              <PopoverContent className="p-4 flex w-[150px] items-center justify-between gap-2 bg-white rounded-lg text-basePrimary">
                <button
                  aria-label="Download pdf"
                  onClick={() =>
                    editor?.savePdf(
                      {
                        width: initialData?.width ?? 900,
                        height: initialData?.height ?? 1200,
                      },
                      `${
                        certificate?.recipientFirstName +
                        "_" +
                        certificate?.recipientLastName
                      }_${certificate?.originalCertificate.name}.pdf`
                    )
                  }
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    xmlnsXlink="http://www.w3.org/1999/xlink"
                    aria-hidden="true"
                    role="img"
                    className="iconify iconify--carbon"
                    width="1.5em"
                    height="1.5em"
                    preserveAspectRatio="xMidYMid meet"
                    viewBox="0 0 32 32"
                  >
                    <path
                      fill="currentColor"
                      d="M30 11V9h-8v14h2v-6h5v-2h-5v-4zM8 9H2v14h2v-5h4a2 2 0 0 0 2-2v-5a2 2 0 0 0-2-2m0 7H4v-5h4zm8 7h-4V9h4a4 4 0 0 1 4 4v6a4 4 0 0 1-4 4m-2-2h2a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2h-2z"
                    />
                  </svg>
                </button>
                <button
                  aria-label="Download png"
                  onClick={() => editor?.savePng()}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    xmlnsXlink="http://www.w3.org/1999/xlink"
                    aria-hidden="true"
                    role="img"
                    className="iconify iconify--tabler"
                    width="1.5em"
                    height="1.5em"
                    preserveAspectRatio="xMidYMid meet"
                    viewBox="0 0 24 24"
                  >
                    <path
                      fill="none"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 8h-2a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h2v-4h-1M3 16V8h2a2 2 0 1 1 0 4H3m7 4V8l4 8V8"
                    />
                  </svg>
                </button>
                <button
                  aria-label="Download jpg"
                  onClick={() => editor?.saveSvg()}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    xmlnsXlink="http://www.w3.org/1999/xlink"
                    aria-hidden="true"
                    role="img"
                    className="iconify iconify--tabler"
                    width="1.5em"
                    height="1.5em"
                    preserveAspectRatio="xMidYMid meet"
                    viewBox="0 0 24 24"
                  >
                    <path
                      fill="none"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 8h-2a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h2v-4h-1M7 8H4a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1h2a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H3m7-8l1.5 8h1L14 8"
                    />
                  </svg>
                </button>
              </PopoverContent>
            </Popover>
          </div>
          <Link
            className="w-full flex gap-2 border p-2 rounded-lg justify-center items-center"
            href={generateLinkedInCertUrl()}
            target="_blank"
            rel="noopener noreferrer"
          >
            <PiLinkedinLogoBold className="size-6" />
            <span>Add to Linkedin profile</span>
          </Link>
        </div>
      </section>
      {certificate?.originalCertificate?.certificateSettings?.skills &&
        certificate?.originalCertificate?.certificateSettings?.skills?.length >
          0 && (
          <div className="bg-white p-4 border rounded-lg w-full h-full space-y-2 flex flex-col items-center gap-4">
            <GradientText className="font-bold" Tag={"h1"}>
              Earned Skills
            </GradientText>
            <div className="flex flex-wrap gap-2">
              {certificate?.originalCertificate?.certificateSettings?.skills.map(
                ({ value, color }) => (
                  <div
                    className="relative text-xs flex items-center gap-1.5 p-2 rounded w-fit md:text-sm"
                    style={{
                      backgroundColor: color + "22",
                      color: color,
                      borderWidth: "2px",
                      borderColor: color + "22",
                    }}
                  >
                    <span className="font-medium capitalize">{value}</span>
                  </div>
                )
              )}
            </div>
          </div>
        )}
    </section>
  );
};

const Page = ({ params }: { params: { certificateId: string } }) => {
  function enforceDesktopView() {
    if (window.innerWidth < 1024) {
      const viewportMeta = document.querySelector("meta[name=viewport]");
      if (viewportMeta) {
        viewportMeta.setAttribute("content", "width=1024");
      }
    }
  }

  useEffect(() => {
    enforceDesktopView();
    window.addEventListener("resize", enforceDesktopView);

    return () => {
      window.removeEventListener("resize", enforceDesktopView);
    };
  }, []);

  const router = useRouter();

  const { certificateId } = params;

  const { data: certificate, isLoading } = useGetData<
    CertificateRecipient & {
      originalCertificate: TCertificate & {
        workspace: TOrganization;
      };
    }
  >(`/certificates/verify/${certificateId}`);

  const { mutateData: recordShare } = useMutateData<{
    social: string;
  }>(`/certificates/verify/${certificateId}/share`, true);

  console.log(certificate, certificateId);

  // if (window.innerWidth < 768) {
  //   return (
  //     <div className="min-h-screen flex flex-col md:flex-row justify-center items-center gap-6 pt-20 pb-8 bg-[#F9FAFF]">
  //       View on a desktop screen for best experience
  //     </div>
  //   );
  // }

  return (
    <section className="min-h-screen space-y-6 pt-20 pb-8 bg-[#F9FAFF]">
      {!isLoading && certificate ? (
        <div className="w-1/2 mx-auto">
          <CertificateView
            certificate={certificate}
            recordShare={recordShare}
          />
        </div>
      ) : !isLoading && !certificate ? (
        <div className="flex items-center justify-center h-[250px] text-xl">
          this certificate does not exist
        </div>
      ) : (
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500 border-solid" />
        </div>
      )}
    </section>
  );
};

export default Page;

export function ActionModal({
  close,
  url,
  shareText,
  recordShare,
}: {
  url?: string;
  instagram?: string;
  close: () => void;
  shareText: string;
  recordShare: ({ payload }: { payload: { social: string } }) => Promise<void>;
}) {
  // const handleShare = () => {
  //   const linkedInUrl = new URL(
  //     "https://www.linkedin.com/sharing/share-offsite/"
  //   );
  //   linkedInUrl.searchParams.set("url", pageUrl);

  //   // Additional parameters (optional, can be embedded in the URL if your page supports Open Graph meta tags)
  //   linkedInUrl.searchParams.set("title", title);
  //   linkedInUrl.searchParams.set("summary", description);
  //   linkedInUrl.searchParams.set("source", imageUrl);

  //   window.open(linkedInUrl.toString(), "_blank");
  // };

  const linkToCertificate = window.location.href;
  return (
    <>
      {/* <Button className="fixed inset-0 bg-none h-full w-full z-[100]"></Button> */}
      <div
        role="button"
        onClick={(e) => {
          e.stopPropagation();
        }}
        className=""
      >
        <button
          onClick={() => {
            recordShare({ payload: { social: "twitter" } });
            window.open(
              `https://twitter.com/intent/tweet?text=${encodeURIComponent(
                shareText
              )}`,
              "_blank"
            );
          }}
          className="items-center flex px-2 h-10 w-full gap-x-2 justify-start text-xs"
        >
          <TwitterIcon className="size-5" />
          <span>X</span>
        </button>

        <button
          className={
            "items-center h-10 gap-x-2 px-2 flex justify-start w-full text-xs"
          }
          onClick={() => recordShare({ payload: { social: "linkedin" } })}
        >
          <LinkedinIcon className="size-5" />
          <span>LinkedIn</span>
        </button>

        <button
          onClick={() => {
            recordShare({ payload: { social: "facebook" } });
            window.open(
              `https://www.facebook.com/sharer/sharer.php?quote=${encodeURIComponent(
                shareText
              )}`,
              "_blank"
            );
          }}
          className={
            "items-center h-10 gap-x-2 px-2 flex justify-start w-full text-xs"
          }
        >
          <FacebookIcon className="size-5" />
          <span>Facebook</span>
        </button>
      </div>
    </>
  );
}
