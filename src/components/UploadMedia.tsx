"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Loader2, UploadCloud, Image as ImageIcon } from "lucide-react";
import { toast } from "react-toastify";
import Image from "next/image";
import useUserStore from "@/store/globalUserStore";
import EmptyList from "../workspace/ui/EmptyList";
import { Attachment } from "@/utils/helpers";
import FilePreviewCard from "./FilePreviewCard";
import useOrganizationStore from "@/store/globalOrganizationStore";


interface FileUploadWrapperProps {
  onSelect?: (key: any) => void;
  uploadFileType?: "image" | "video" | "application" | "audio" | "multipart" | "text";
  maxSize?: number; // max file size in bytes in MB
  children: React.ReactNode;
}

export default function UploadMedia({
  children,
  onSelect,
  uploadFileType,
  maxSize,
}: FileUploadWrapperProps) {
  const { user } = useUserStore();
  const {organization: currentWorkSpace} = useOrganizationStore()
  const userId = user?.id!;
  const organizationAlias = currentWorkSpace?.organizationAlias!;
  const [file, setFile] = useState<File | null>(null);
  const [filename, setFilename] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;

    if (selectedFile) {
      // Validate file type
      if (uploadFileType && !selectedFile.type.startsWith(uploadFileType)) {
        toast.error(`Please select a file of type: ${uploadFileType}`);
        setFile(null);
        setFilename("");
        if (fileInputRef.current) fileInputRef.current.value = "";
        return;
      }

      const maxSizeMB = maxSize ? (maxSize * (1024 * 1024)) : null;
      // Validate file size
      if (maxSizeMB && selectedFile.size > maxSizeMB ) {
        toast.error(`File size exceeds the maximum allowed (${maxSizeMB.toFixed(2)} MB).`);
        setFile(null);
        setFilename("");
        if (fileInputRef.current) fileInputRef.current.value = "";
        return;
      }

      setFile(selectedFile);
      setFilename(selectedFile.name.split(".")[0] || "");
    } else {
      setFile(null);
      setFilename("");
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error("No file selected.");
      return;
    }

    setIsUploading(true);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("filename", filename);
    formData.append("organizationAlias", organizationAlias);
    formData.append("userId", String(userId));

    try {
      const res = await fetch("/api/media/upload", {
        method: "POST",
        body: formData,
      });

      const result = await res.json();
      if (!res.ok) { // Check for non-2xx responses
        throw new Error(result.error || "Upload failed");
      }

      toast.success("Uploaded successfully");
      onSelect && onSelect(result.data);
    } catch (error: any) {
      toast.error(error.message || "An unexpected error occurred during upload.");
    } finally {
      setIsUploading(false);
      setFile(null);
      setFilename("");
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Determine the 'accept' attribute for the file input based on uploadFileType
  const getAcceptAttribute = (type?: FileUploadWrapperProps['uploadFileType']): string => {
    switch (type) {
      case "image":
        return "image/*";
      case "video":
        return "video/*";
      case "application":
        return "application/*";
      case "audio":
        return "audio/*";
      case "text":
        return "text/*";
      case "multipart": // This case might need specific handling depending on your needs. For general files, often no specific accept.
        return "*/*";
      default:
        return "*/*"; // Allow all file types by default
    }
  };

  return (
    <div className="space-y-2">
      <div>{children}</div>

      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          className="flex items-center gap-2"
          onClick={() => fileInputRef.current?.click()}
        >
          <UploadCloud className="w-4 h-4" /> Upload New
        </Button>

        <Input
          type="file"
          accept={getAcceptAttribute(uploadFileType)} // Restrict to uploadFileType if available
          ref={fileInputRef}
          className="hidden"
          onChange={handleFileChange}
        />

        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2">
              <ImageIcon className="w-4 h-4" /> Choose from media
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[80vh] p-4 overflow-auto ">
            <MediaPicker
              organizationAlias={organizationAlias}
              onSelect={(media) => {
                onSelect && onSelect(media);
                setSheetOpen(false);
              }}
            />
          </SheetContent>
        </Sheet>
      </div>

      {file && (
        <div className="space-y-2">
          <Input
            placeholder="Enter filename"
            value={filename}
            onChange={(e) => setFilename(e.target.value)}
          />

          <Button
            disabled={isUploading}
            onClick={handleUpload}
            className="w-full flex items-center gap-2"
          >
            {isUploading && <Loader2 className="w-4 h-4 animate-spin" />}
            Upload {filename || file.name}
          </Button>
        </div>
      )}
    </div>
  );
}


interface MediaPickerProps {
  organizationAlias: string;
  onSelect: (media: any) => void;
}


export function MediaPicker({ organizationAlias, onSelect }: MediaPickerProps) {
  const [media, setMedia] = useState<Attachment[]>([]);
  const [loading, setLoading] = useState(true);
  const [tableSize, setTableSize] = useState(1);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);

  const observerRef = useRef<HTMLDivElement | null>(null);
  const isFetchingRef = useRef(false);

  const fetchMedia = useCallback(async (nextPage = 1) => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;
    setLoading(true);

    try {
      const res = await fetch(`/api/media?organizationAlias=${organizationAlias}&page=${nextPage}`);
      const { data, count, error } = await res.json();

      if (error) setError(error);
      if (data) {
        setMedia((prev) => (nextPage === 1 ? data : [...prev, ...data]));
        setTableSize(count);
      }
    } catch (err) {
      console.error("Error fetching media", err);
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  }, [organizationAlias]);

  useEffect(() => {
    // Reset and fetch first page on organization change
    setPage(1);
    setMedia([]);
    fetchMedia(1);
  }, [organizationAlias, fetchMedia]);

  useEffect(() => {
    if (!observerRef.current || media.length >= tableSize) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && !loading && media.length < tableSize) {
          const nextPage = page + 1;
          setPage(nextPage);
          fetchMedia(nextPage);
        }
      },
      { rootMargin: "100px" } // preload slightly before hitting bottom
    );

    const el = observerRef.current;
    observer.observe(el);

    return () => {
      if (el) observer.unobserve(el);
    };
  }, [media, page, loading, tableSize, fetchMedia]);

  return (
    <section className="mx-auto max-w-4xl">
      <h2 className="text-lg font-semibold mb-4">Your Media</h2>

      {loading && media.length === 0 ? (
        <div className="py-20 flex justify-center">
          <Loader2 className="animate-spin text-blue-700" />
        </div>
      ) : error ? (
        <EmptyList className="h-60" text={error} />
      ) : media.length === 0 ? (
        <EmptyList className="h-60" text="No media found" />
      ) : (
        <>
          <div className="flex justify-center flex-wrap gap-4">
            {media.map((item) => (
              <button
                key={item.id}
                className="border rounded-md overflow-hidden hover:ring-2 ring-primary focus:outline-none"
                onClick={() => onSelect(item)}
              >
                <div className="relative w-full max-w-40 h-44">
                  <FilePreviewCard 
                    item={item}
                    onDownload={()=>{}}
                    onRemove={()=>{}}
                    onView={()=>{}}
                    />
                </div>
              </button>
            ))}
          </div>

          {/* Sentinel for Intersection Observer */}
          <div ref={observerRef} className="h-10 w-full mt-4 flex justify-center items-center">
            {loading && <Loader2 className="animate-spin text-blue-500" />}
          </div>
        </>
      )}
    </section>
  );
}
