"use client";
import { useEditor } from "@/components/editor/hooks/use-editor";
import { useGetData } from "@/hooks/services/request";
import { CertificateRecipient, TCertificate } from "@/types/certificates";
import { TOrganization } from "@/types/organization";
import { replaceSpecialText, replaceURIVariable } from "@/utils/helpers";
import React, { useEffect, useRef, useState } from "react";
import { fabric } from "fabric";
import { Eye } from "lucide-react";
import Link from "next/link";

interface TTab {
  label: string;
  Component: React.FC;
}

// const tabs =

const CertificateView = ({
  certificate,
}: {
  certificate: CertificateRecipient & {
    originalCertificate: TCertificate & {
      workspace: TOrganization;
    };
  };
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

  return (
    <section>
      <section className="grid grid-cols-12 gap-4">
        <div className="bg-white p-4 border rounded-md w-full col-span-4"></div>
        <div className="bg-white p-4 border rounded-md w-full col-span-8 h-fit">
          <div
            className="relative h-[500px] md:h-[calc(100%-124px)] w-full hidden"
            ref={containerRef}
          >
            <div className="absolute inset-0 bg-transparent z-50" />
            <canvas ref={canvasRef} />
          </div>
          <Link
            href={
              "/credentials/verify/certificate/" + certificate.certificateId
            }
            className="border-basePrimary border-2 text-basePrimary bg-transparent hover:bg-basePrimary/20 flex gap-2 items-center justify-center rounded-md py-2 px-4 ml-auto w-fit text-sm"
          >
            <Eye className="size-4" />
            <span>User View</span>
          </Link>
          <div className="relative h-full w-full flex justify-center items-center flex-1">
            <img
              alt="certificate"
              src={editor?.generateLink(true)}
              style={{ width: "50%" }}
              className="h-auto"
            />{" "}
          </div>
        </div>
      </section>
    </section>
  );
};

const AdminView = ({ certificateId }: { certificateId: string }) => {
  const { data: certificate, isLoading } = useGetData<
    CertificateRecipient & {
      originalCertificate: TCertificate & {
        workspace: TOrganization;
      };
    }
  >(`/certificates/verify/${certificateId}`);

  return (
    <section>
      {!isLoading && certificate ? (
        <div className="w-[90%] mx-auto">
          <CertificateView certificate={certificate} />
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

export default AdminView;
