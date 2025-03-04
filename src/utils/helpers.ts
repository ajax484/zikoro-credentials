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

      console.log(data);

      return { url: data.url, error: null };
    } else {
      throw "failed to upload file";
    }
  } catch (error) {
    console.error("Error uploading image:", error);
    return { url: null, error };
  }
}

export function generateCloudinarySignature(
  params: Record<string, string | number>,
  apiSecret: string
): string {
  const excludedKeys = ["file", "cloud_name", "resource_type", "api_key"];
  const filteredParams = Object.entries(params)
    .filter(([key]) => !excludedKeys.includes(key))
    .reduce((acc, [key, value]) => {
      acc[key] = value;
      return acc;
    }, {} as Record<string, string | number>);

  if (!filteredParams.timestamp) {
    filteredParams.timestamp = Math.floor(Date.now() / 1000);
  }

  const sortedParams = Object.keys(filteredParams)
    .sort()
    .map((key) => `${key}=${filteredParams[key]}`)
    .join("&");

  const stringToSign = `${sortedParams}${apiSecret}`;

  return crypto.createHash("sha1").update(stringToSign).digest("hex");
}

export async function deleteCloudinaryImage(url: string): Promise<void> {
  const id = getPublicCloudinaryId(url);

  if (!id) {
    console.error("Invalid Cloudinary public ID");
    return;
  }

  const apiKey = "YOUR_API_KEY";
  const apiSecret = "YOUR_API_SECRET";
  const timestamp = Math.floor(Date.now() / 1000);

  const signature = generateCloudinarySignature(
    { public_id: id, timestamp: timestamp, api_key: apiKey },
    apiSecret
  );

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/zikoro/image/destroy`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          public_id: id,
          timestamp: timestamp.toString(),
          api_key: apiKey,
          signature: signature,
        }).toString(),
      }
    );

    const data = await response.json();

    if (response.ok) {
      console.log("Image deleted successfully:", data);
    } else {
      console.error("Failed to delete image:", data);
    }
  } catch (error) {
    console.error("Error deleting image:", error);
  }
}

export function getPublicCloudinaryId(url: string): string | null {
  const match = url.match(/\/upload\/(?:v\d+\/)?([^\.]+)/);
  return match ? match[1] : null;
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

export function dataUrlToFile(dataUrl, fileName) {
  // Split the Data URL into the metadata and the base64 data
  const [metadata, base64Data] = dataUrl.split(",");
  const mimeType = metadata.match(/:(.*?);/)[1]; // Extract the MIME type
  const binaryData = atob(base64Data); // Decode the base64 data
  const dataArray = new Uint8Array(binaryData.length);

  // Convert the binary string to an array of bytes
  for (let i = 0; i < binaryData.length; i++) {
    dataArray[i] = binaryData.charCodeAt(i);
  }

  // Create a Blob from the byte array
  const blob = new Blob([dataArray], { type: mimeType });

  // Return a File object
  return new File([blob], fileName, { type: mimeType });
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
    // console.log(value, context.asset?.attributes, "attribute");
    if (
      context.asset?.attributes &&
      context.asset?.attributes?.includes(value.trim())
    ) {
      return context?.recipient?.metadata?.[value.trim()] || "N/A";
    }

    switch (value.trim()) {
      case "first_name":
        return context.recipient.recipientFirstName;
      case "last_name":
        return context.recipient.recipientLastName;
      case "recipient_email":
        return context.recipient.recipientEmail;
      case "certificateId":
        return context.recipient.certificateId;
      case "certificate_link":
        return (
          "https://www.credentials.zikoro.com/credentials/verify/certificate/" +
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

export function formatNumber(num: number): string {
  if (num >= 1_000_000_000) {
    return (num / 1_000_000_000).toFixed(1).replace(/\.0$/, "") + "b"; // Billion
  }
  if (num >= 1_000_000) {
    return (num / 1_000_000).toFixed(1).replace(/\.0$/, "") + "m"; // Million
  }
  if (num >= 1_000) {
    return (num / 1_000).toFixed(1).replace(/\.0$/, "") + "k"; // Thousand
  }
  if (num >= 100) {
    return (num / 100).toFixed(1).replace(/\.0$/, "") + "h"; // Hundred
  }
  return num.toString(); // Less than 100, no formatting
}

export function getTextColorFromBackground(backgroundColor: string): string {
  // Convert rgba color to RGB

  const rgbaToRgb = (rgba: string): { r: number; g: number; b: number } => {
    const match = rgba.match(/^rgba?\((\d+), (\d+), (\d+), (\d?\.?\d+)\)$/);
    if (match) {
      return {
        r: parseInt(match[1]),
        g: parseInt(match[2]),
        b: parseInt(match[3]),
      };
    }
    throw new Error("Invalid rgba format");
  };

  // Calculate luminance of a color
  const luminance = (rgb: { r: number; g: number; b: number }) => {
    const [r, g, b] = [rgb.r, rgb.g, rgb.b].map((c) => {
      const normalized = c / 255;
      return normalized <= 0.03928
        ? normalized / 12.92
        : Math.pow((normalized + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };

  const rgb = rgbaToRgb(backgroundColor);
  const colorLuminance = luminance(rgb);

  // Return 'light' or 'dark' based on luminance
  return colorLuminance > 0.5 ? "black" : "white";
}

/**
 * Generates a WhatsApp URL with a pre-filled message.
 * @param phoneNumber - The recipient's phone number in international format (e.g., +1234567890).
 * @param message - The message to pre-fill.
 * @returns The WhatsApp URL.
 */
export function generateWhatsAppUrl(
  phoneNumber: string,
  message: string
): string {
  // Encode the message for use in a URL
  const encodedMessage = encodeURIComponent(message);
  // Create the WhatsApp URL
  return `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
}

/**
 * Opens WhatsApp with a pre-filled message.
 * @param phoneNumber - The recipient's phone number in international format (e.g., +1234567890).
 * @param message - The message to pre-fill.
 */
export function openWhatsApp(phoneNumber: string, message: string): void {
  const url = generateWhatsAppUrl(phoneNumber, message);
  // Open the URL in a new tab or window
  window.open(url, "_blank");
}
