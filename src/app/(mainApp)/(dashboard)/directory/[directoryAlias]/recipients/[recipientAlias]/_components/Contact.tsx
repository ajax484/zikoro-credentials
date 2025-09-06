import { DirectoryRecipient } from "@/types/directories";
import { ArrowUpRight, Copy } from "@phosphor-icons/react";
import Link from "next/link";
import React, { useState } from "react";

const Contact = ({ recipient }: { recipient: DirectoryRecipient }) => {
  const ContactInfo = ({
    value,
    label,
    link,
  }: {
    value: string;
    label: string;
    link: string;
  }) => {
    const [copied, setCopied] = useState(false);

    // copy to clipboard'
    const copyToClipboard = (text: string) => {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    };

    return (
      <div className="border bg-white p-2 flex justify-between items-center rounded-md">
        <div className="flex flex-1 flex-col gap-1">
          <h6 className="text-xs font-semibold text-zikoroGray">{label}</h6>
          <h6 className="text-sm text-zikoroBlack underline">{value}</h6>
        </div>
        <div className="flex gap-2 items-center">
          <Link href={link} target="_blank" rel="noopener noreferrer">
            <ArrowUpRight
              size={24}
              className="text-zikoroBlack"
              weight="bold"
            />
          </Link>
          <button aria-label="copy" onClick={() => copyToClipboard(value)}>
            <Copy size={24} className="text-zikoroBlack" weight="bold" />
          </button>
        </div>
      </div>
    );
  };
  return (
    <div className="md:w-1/2 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ContactInfo
          value={recipient?.email}
          label="Email"
          link={"mailto:" + recipient?.email}
        />
        <ContactInfo
          value={recipient?.phone}
          label="Phone"
          link={"tel:" + recipient?.phone}
        />
      </div>
      <h6 className="text-xs font-semibold text-zikoroBlack">Social Links</h6>
      {recipient?.instagram && (
        <ContactInfo
          value={recipient?.instagram}
          label="Instagram"
          link={recipient?.instagram}
        />
      )}
      {recipient?.linkedIn && (
        <ContactInfo
          value={recipient?.linkedIn}
          label="LinkedIn"
          link={recipient?.linkedIn}
        />
      )}
      {recipient?.facebook && (
        <ContactInfo
          value={recipient?.facebook}
          label="Facebook"
          link={recipient?.facebook}
        />
      )}
      {recipient?.twitter && (
        <ContactInfo
          value={recipient?.twitter}
          label="Twitter"
          link={recipient?.twitter}
        />
      )}
    </div>
  );
};

export default Contact;
