"use client";
import { formatDateToHumanReadable } from "@/utils/date";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
// import { exportComponentAsPNG } from "react-component-export-image";
import { replaceSpecialText, replaceURIVariable } from "@/utils/helpers";
import { toast } from "@/hooks/use-toast";
import { fabric } from "fabric";
import {
  FacebookIcon,
  LinkedinIcon,
  LinkedinShareButton,
  TwitterIcon,
} from "next-share";
import { useEditor } from "@/components/editor/hooks/use-editor";
import { Button } from "@/components/ui/button";
import { useGetData, useMutateData } from "@/hooks/services/request";
import { CertificateRecipient, TCertificate } from "@/types/certificates";
import { TOrganization } from "@/types/organization";
import GradientText from "@/components/GradientText";
import Image from "next/image";
import Link from "next/link";
import { Facebook, Instagram, Linkedin } from "styled-icons/bootstrap";
import { Calendar, Download, X } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

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

  console.log(certificate?.originalCertificate, "initialData");

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

  console.log(newState);

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

  return (
    <section className="space-y-6">
      <div className="bg-white p-4 border rounded-md w-full">
        {/* <div className="hidden md:flex gap-2 flex-col md:flex-row items-center justify-between">
        <Button
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
          className="bg-basePrimary"
        >
          Download PDF
        </Button>
        <Button
          onClick={() => editor?.savePng()}
          className="border-basePrimary border-2 text-basePrimary bg-transparent hover:bg-basePrimary/20"
        >
          Download PNG
        </Button>
        <Button
          onClick={() => editor?.saveSvg()}
          className="border-basePrimary border-2 text-basePrimary bg-transparent hover:bg-basePrimary/20"
        >
          Download SVG
        </Button>
        <div className="relative">
          <Button
            onClick={(e) => {
              e.stopPropagation();
              toggleShareDropDown();
            }}
            className="border-basePrimary border-2 text-basePrimary bg-transparent hover:bg-basePrimary/20"
          >
            <svg
              stroke="currentColor"
              fill="currentColor"
              strokeWidth={0}
              viewBox="0 0 24 24"
              height="1em"
              width="1em"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle fill="none" cx="17.5" cy="18.5" r="1.5" />
              <circle fill="none" cx="5.5" cy="11.5" r="1.5" />
              <circle fill="none" cx="17.5" cy="5.5" r="1.5" />
              <path d="M5.5,15c0.91,0,1.733-0.358,2.357-0.93l6.26,3.577C14.048,17.922,14,18.204,14,18.5c0,1.93,1.57,3.5,3.5,3.5 s3.5-1.57,3.5-3.5S19.43,15,17.5,15c-0.91,0-1.733,0.358-2.357,0.93l-6.26-3.577c0.063-0.247,0.103-0.502,0.108-0.768l6.151-3.515 C15.767,8.642,16.59,9,17.5,9C19.43,9,21,7.43,21,5.5S19.43,2,17.5,2S14,3.57,14,5.5c0,0.296,0.048,0.578,0.117,0.853L8.433,9.602 C7.808,8.64,6.729,8,5.5,8C3.57,8,2,9.57,2,11.5S3.57,15,5.5,15z M17.5,17c0.827,0,1.5,0.673,1.5,1.5S18.327,20,17.5,20 S16,19.327,16,18.5S16.673,17,17.5,17z M17.5,4C18.327,4,19,4.673,19,5.5S18.327,7,17.5,7S16,6.327,16,5.5S16.673,4,17.5,4z M5.5,10C6.327,10,7,10.673,7,11.5S6.327,13,5.5,13S4,12.327,4,11.5S4.673,10,5.5,10z" />
            </svg>
            <h3 className="font-medium">Share this Certificate</h3>
            {isShareDropDown && (
              <ActionModal
                recordShare={recordShare}
                close={toggleShareDropDown}
                url={window.location.href}
                shareText={shareText}
              />
            )}
          </Button>
        </div>
      </div>
      <div className="md:hidden w-full flex gap-2 justify-around items-center">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="bg-basePrimary w-fit px-4">Download</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-full">
            <DropdownMenuItem
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
              Download PDF
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => editor?.savePng()}>
              Download PNG
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => editor?.saveSvg()}>
              Download SVG
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <div className="relative">
          <Button
            onClick={(e) => {
              e.stopPropagation();
              toggleShareDropDown();
            }}
            className="border-basePrimary border-2 text-basePrimary bg-transparent hover:bg-basePrimary/20"
          >
            <svg
              stroke="currentColor"
              fill="currentColor"
              strokeWidth={0}
              viewBox="0 0 24 24"
              height="1em"
              width="1em"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle fill="none" cx="17.5" cy="18.5" r="1.5" />
              <circle fill="none" cx="5.5" cy="11.5" r="1.5" />
              <circle fill="none" cx="17.5" cy="5.5" r="1.5" />
              <path d="M5.5,15c0.91,0,1.733-0.358,2.357-0.93l6.26,3.577C14.048,17.922,14,18.204,14,18.5c0,1.93,1.57,3.5,3.5,3.5 s3.5-1.57,3.5-3.5S19.43,15,17.5,15c-0.91,0-1.733,0.358-2.357,0.93l-6.26-3.577c0.063-0.247,0.103-0.502,0.108-0.768l6.151-3.515 C15.767,8.642,16.59,9,17.5,9C19.43,9,21,7.43,21,5.5S19.43,2,17.5,2S14,3.57,14,5.5c0,0.296,0.048,0.578,0.117,0.853L8.433,9.602 C7.808,8.64,6.729,8,5.5,8C3.57,8,2,9.57,2,11.5S3.57,15,5.5,15z M17.5,17c0.827,0,1.5,0.673,1.5,1.5S18.327,20,17.5,20 S16,19.327,16,18.5S16.673,17,17.5,17z M17.5,4C18.327,4,19,4.673,19,5.5S18.327,7,17.5,7S16,6.327,16,5.5S16.673,4,17.5,4z M5.5,10C6.327,10,7,10.673,7,11.5S6.327,13,5.5,13S4,12.327,4,11.5S4.673,10,5.5,10z" />
            </svg>
            <h3 className="font-medium">Share This Certificate</h3>
            {isShareDropDown && (
              <ActionModal
                recordShare={recordShare}
                close={toggleShareDropDown}
                url={window.location.href}
                shareText={shareText}
              />
            )}
          </Button>
        </div>
      </div> */}

        <div
          className="relative h-[500px] md:h-[calc(100%-124px)] w-full hidden"
          ref={containerRef}
        >
          <div className="absolute inset-0 bg-transparent z-50" />
          <canvas ref={canvasRef} />
        </div>

        <div className="relative h-full w-full flex justify-center items-center flex-1">
          <img
            alt="certificate"
            src={editor?.generateLink(true)}
            style={{ width: "50%" }}
            className="h-auto"
          />{" "}
        </div>
      </div>
      <section className="grid grid-cols-2 gap-4">
        <div className="bg-white p-4 border rounded-md w-full h-full space-y-2 flex flex-col items-center gap-2">
          <div className="flex justify-between items-center w-full">
            <GradientText className="font-bold" Tag={"h1"}>
              Issued by
            </GradientText>
            <div>i</div>
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
          <span className="text-gray-600 font-medium">
            {certificate?.originalCertificate?.workspace?.organizationName}
          </span>

          <div className="flex items-center justify-center gap-4 text-gray-600">
            <Link
              href={
                certificate?.originalCertificate?.workspace?.linkedIn || "#"
              }
              className="flex items-center gap-2"
            >
              <Linkedin className="size-4" />
            </Link>
            <Link
              href={certificate?.originalCertificate?.workspace?.x || "#"}
              className="flex items-center gap-2"
            >
              <X className="size-4" />
            </Link>
            <Link
              href={
                certificate?.originalCertificate?.workspace?.facebook || "#"
              }
              className="flex items-center gap-2"
            >
              <Facebook className="size-4" />
            </Link>
            <Link
              href={
                certificate?.originalCertificate?.workspace?.instagram || "#"
              }
              className="flex items-center gap-2"
            >
              <Instagram className="size-4" />
            </Link>
          </div>
        </div>
        <div className="bg-white p-4 border rounded-md w-full h-full space-y-2 flex flex-col items-center gap-4">
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
            <Button
              onClick={(e) => {
                e.stopPropagation();
                toggleShareDropDown();
              }}
              className="bg-basePrimary text-white hover:bg-basePrimary/20 py-1 px-2 h-fit"
            >
              {/* <svg
                  stroke="currentColor"
                  fill="currentColor"
                  strokeWidth={0}
                  viewBox="0 0 24 24"
                  height="1em"
                  width="1em"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle fill="none" cx="17.5" cy="18.5" r="1.5" />
                  <circle fill="none" cx="5.5" cy="11.5" r="1.5" />
                  <circle fill="none" cx="17.5" cy="5.5" r="1.5" />
                  <path d="M5.5,15c0.91,0,1.733-0.358,2.357-0.93l6.26,3.577C14.048,17.922,14,18.204,14,18.5c0,1.93,1.57,3.5,3.5,3.5 s3.5-1.57,3.5-3.5S19.43,15,17.5,15c-0.91,0-1.733,0.358-2.357,0.93l-6.26-3.577c0.063-0.247,0.103-0.502,0.108-0.768l6.151-3.515 C15.767,8.642,16.59,9,17.5,9C19.43,9,21,7.43,21,5.5S19.43,2,17.5,2S14,3.57,14,5.5c0,0.296,0.048,0.578,0.117,0.853L8.433,9.602 C7.808,8.64,6.729,8,5.5,8C3.57,8,2,9.57,2,11.5S3.57,15,5.5,15z M17.5,17c0.827,0,1.5,0.673,1.5,1.5S18.327,20,17.5,20 S16,19.327,16,18.5S16.673,17,17.5,17z M17.5,4C18.327,4,19,4.673,19,5.5S18.327,7,17.5,7S16,6.327,16,5.5S16.673,4,17.5,4z M5.5,10C6.327,10,7,10.673,7,11.5S6.327,13,5.5,13S4,12.327,4,11.5S4.673,10,5.5,10z" />
                </svg> */}
              <h3 className="font-medium text-[10px]">Share Credential</h3>
              {isShareDropDown && (
                <ActionModal
                  recordShare={recordShare}
                  close={toggleShareDropDown}
                  url={window.location.href}
                  shareText={shareText}
                />
              )}
            </Button>
            <Popover>
              <PopoverTrigger>
                <Download className="size-4" />
              </PopoverTrigger>
              <PopoverContent className="p-4 flex w-[150px] items-center justify-between gap-2 bg-white rounded-md text-basePrimary">
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
        </div>
      </section>
      {certificate?.originalCertificate?.certificateSettings?.skills && (
        <div className="bg-white p-4 border rounded-md w-full h-full space-y-2 flex flex-col items-center gap-4">
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
        <div>this certificate does not exist</div>
      ) : (
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500 border-solid" />
        </div>
      )}
    </section>
  );
};

export default Page;

function ActionModal({
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
      <div className="absolute left-0 top-10 w-48 z-[1000]">
        {/* <Button className="fixed inset-0 bg-none h-full w-full z-[100]"></Button> */}
        <div
          role="button"
          onClick={(e) => {
            e.stopPropagation();
          }}
          className="flex relative z-[50] flex-col py-4 items-start justify-start bg-white rounded-lg w-full h-fit shadow-lg"
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
            <TwitterIcon />
            <span>X</span>
          </button>

          <button
            className={
              "items-center h-10 gap-x-2 px-2 flex justify-start w-full text-xs"
            }
          >
            <button
              className={
                "items-center h-10 gap-x-2 px-2 flex justify-start w-full text-xs"
              }
              onClick={() => recordShare({ payload: { social: "linkedin" } })}
            >
              <LinkedinIcon />
              <span>LinkedIn</span>
            </button>
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
            <FacebookIcon />
            <span>Facebook</span>
          </button>
        </div>
      </div>
    </>
  );
}
