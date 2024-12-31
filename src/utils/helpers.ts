import { TAttendeeBadge } from "@/types";
import {
  CertificateRecipient,
  TAttendeeCertificate,
} from "@/types/certificates";
import { TOrganization } from "@/types/organization";
import * as crypto from "crypto";
import { v4 as uuidv4 } from "uuid";

export function rgbaToHex(rgba: string): string {
  const match = rgba.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)$/);

  if (!match) {
    throw new Error("Invalid RGBA format");
  }

  let [_, r, g, b, a] = match;

  r = parseInt(r).toString(16).padStart(2, "0");
  g = parseInt(g).toString(16).padStart(2, "0");
  b = parseInt(b).toString(16).padStart(2, "0");
  a = Math.round(parseFloat(a) * 255)
    .toString(16)
    .padStart(2, "0");

  return `${r}${g}${b}${a === "ff" ? "" : a}`;
}

export function extractUniqueTypes<T>(
  arr: T[],
  ppty: keyof T
): { label: string; value: string }[] {
  const uniqueTypesSet = new Set<string>(
    arr.flatMap((obj) => {
      const value = obj[ppty];
      return value != null ? (Array.isArray(value) ? value : [value]) : [];
    })
  );

  return Array.from(uniqueTypesSet).map((value) => ({
    label: value,
    value,
  }));
}

type CamelCaseObject = { [key: string]: any };

export function convertCamelToNormal<T extends CamelCaseObject>(
  data: T[],
  separator: "-" | "_" | " "
): T[] {
  return data.map((item) => {
    const convertedItem: CamelCaseObject = {};

    for (const key in item) {
      if (Object.prototype.hasOwnProperty.call(item, key)) {
        const newKey = key
          .replace(/([a-z])([A-Z])/g, `$1${separator}$2`)
          .toLowerCase();

        convertedItem[newKey] = item[key];
      }
    }

    return convertedItem as T;
  });
}

export function calculateAndSetMaxHeight(
  divRef: React.RefObject<HTMLDivElement>
) {
  const div = divRef.current;

  if (div) {
    // Get the distance from the top of the div to the bottom of the screen
    const distanceToBottom = window.innerHeight - div.offsetTop;

    // Set the maximum height of the div
    div.style.maxHeight = `${distanceToBottom}px`;
  }
}

export function generateAlphanumericHash(length?: number): string {
  const characters =
    "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  const hashLength = length || 18;
  let hash = "";

  for (let i = 0; i < hashLength; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    hash += characters.charAt(randomIndex);
  }

  return hash;
}

export function createHash(data: string): string {
  const hash = crypto.createHash("sha256");
  hash.update(data);
  const fullHash = hash.digest("hex");
  return fullHash.substring(0, 12);
}

export function getProperty<T>(obj: T, key: keyof T): any {
  if (typeof obj === "object" && obj !== null && key in obj) {
    return (obj as Record<keyof T, any>)[key];
  }
  return null; // Handle the case where the key is not present
}

export function areAllPropertiesSet(obj: Record<string, any>): boolean {
  for (const key in obj) {
    if (
      (obj.hasOwnProperty(key) && obj[key] === undefined) ||
      obj[key] === null ||
      obj[key] === ""
    ) {
      return false;
    }
  }
  return true;
}

export function findKeysWithSharedValue(
  map: Map<any, any>
): Map<string, any[]> {
  const encounteredValues: Map<string, any[]> = new Map();

  for (let [key, value] of Array.from(map)) {
    if (encounteredValues.has(value) && value) {
      encounteredValues.get(value)!.push(key);
    } else {
      encounteredValues.set(value, [key]);
    }
  }

  // Filter and return only entries where multiple keys share the same value
  return new Map(
    Array.from(encounteredValues.entries()).filter(
      ([value, keys]) => keys.length > 1
    )
  );
}

export async function uploadFiles(files: File[]) {
  const url =
    "https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUDNAME}/image/upload";

  const formData = new FormData();

  for (let i = 0; i < files.length; i++) {
    try {
      let file = files[i];
      formData.append("file", file);
      // formData.append("upload_preset", "docs_upload_example_us_preset");
      const response = await fetch(url, {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.text();
        alert("Files uploaded successfully");
      } else {
        throw new Error("Failed to upload files");
      }
    } catch (error) {
      console.error(error);
    }
  }
}

export async function uploadFile(
  file: File | string,
  type: string
): Promise<{ url: string | null; error: any | null }> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("cloud_name", "zikoro");
  formData.append("upload_preset", "w5xbik6z");
  formData.append("folder", "ZIKORO");
  type === "video" && formData.append("resource_type", "video");

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/zikoro/${type}/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    if (response.ok) {
      const data = await response.json();

      return { url: data.url, error: null };
    } else {
      throw "failed to upload file";
    }
  } catch (error) {
    console.error("Error uploading image:", error);
    return { url: null, error };
  }
}

export function base64ToFile(base64Data: string, fileName: string): File {
  const byteCharacters = atob(base64Data.split(",")[1]);
  const byteNumbers = new Array<number>(byteCharacters.length);

  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }

  const byteArray = new Uint8Array(byteNumbers);
  const blob = new Blob([byteArray], { type: "image/png" });

  return new File([blob], fileName, { type: "image/png" });
}

type Context = {
  asset: TAttendeeCertificate | TAttendeeBadge;
  recipient: CertificateRecipient;
  organization: TOrganization;
};

export function replaceURIVariable(
  input: string,
  certificateId: string
): string {
  return input.replaceAll(/%23%7B(.*?)%23%7D/g, (match, value) => {
    return certificateId;
  });
}

export function replaceSpecialText(input: string, context: Context): string {
  const pattern = /#{(.*?)#}/g;

  if (pattern.test(input)) {
  } else {
  }

  return input.replaceAll(/#{(.*?)#}/g, (match, value) => {
    switch (value.trim()) {
      case "first_name":
        return context.recipient.recipientFirstName;
      case "last_name":
        return context.recipient.recipientLastName;
      case "recipient_email":
        return context.recipient.recipientEmail;
      case "certificate_id":
        return context.recipient.certificateId;
      case "certificate_link":
        return (
          "www.zikoro-credentials.com/credentials/verify/certificate/" +
          context.recipient.certificateId
        );
      case "organization_name":
        return context.organization.organizationName;
      case "organisation_logo":
        return context.organization.organizationLogo || "";
      default:
        return match;
    }
  });
}

export function maskAccountNumber(accountNumber: string): string {
  const visibleDigits = accountNumber.slice(-4); // Get the last 4 digits
  const maskedDigits = accountNumber.slice(0, -4).replace(/\d/g, "*"); // Replace all other digits with '*'
  return `${maskedDigits}${visibleDigits}`;
}

export function generateAlias(): string {
  const alias = uuidv4().replace(/-/g, "").substring(0, 20);

  return alias;
}

export function applyCredentialsDiscount(
  quantity: number,
  price: number
): number {
  const amount = quantity * price;

  switch (true) {
    case quantity > 499 && quantity < 1000:
      return amount * 0.6;
    case quantity > 999 && quantity < 2500:
      return amount * 0.55;
    case quantity > 2499 && quantity < 5000:
      return amount * 0.5;
    case quantity > 4999 && quantity < 10000:
      return amount * 0.45;
    case quantity > 9999 && quantity < 25000:
      return amount * 0.4;
    case quantity > 24999 && quantity < 50000:
      return amount * 0.35;
    case quantity > 49999:
      return amount * 0.3;
    default:
      return amount;
  }
}
