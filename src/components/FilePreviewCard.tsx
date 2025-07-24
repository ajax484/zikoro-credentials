// components/FilePreviewCard.tsx
import Image from 'next/image';
import {
  FileText,
  Music,
  Video,
  File,
  XCircle,
  Download,
  Eye, // For view action
} from 'lucide-react'; // Example icons, adjust as needed
import { Attachment } from '@/utils/cloudinary';
import { cn } from '@/lib';

interface FilePreviewCardProps {
  item: Attachment;
  className?:string;
  onRemove?: (id: number) => void; // Optional: for removing the file from a selection
  onDownload?: (item: Attachment) => void; // Optional: for triggering download
  onView?: (item: Attachment) => void; // Optional: for opening full preview (e.g., in a modal)
}

export default function FilePreviewCard({ item, onRemove, onDownload, onView, className }: FilePreviewCardProps) {
  const fileDisplayName = item.display_name || item.public_id || 'Unknown File';
  const fileExtension = item.format ? `.${item.format}` : '';

  const renderFileContent = () => {
    if (!item.secure_url) {
      return (
        <div className="flex flex-col items-center justify-center text-red-500 w-full h-full bg-gray-50">
          <XCircle className="w-8 h-8" />
          <p className="text-xs text-center mt-1">No URL</p>
        </div>
      );
    }

    switch (item.resource_type) {
      case 'image':
        return (
          <Image
            src={item.secure_url}
            alt={fileDisplayName}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover rounded-md"
            priority={false} // Adjust based on your layout and performance needs
          />
        );
      case 'video':
        return (
          <video
            src={item.secure_url}
            controls={false}
            muted
            loop
            className="object-cover w-full h-full rounded-md"
            preload="metadata"
            title={`Preview of ${fileDisplayName}`}
          >
            Your browser does not support the video tag.
          </video>
        );
      case 'audio':
        return (
          <div className="flex flex-col items-center justify-center h-full bg-blue-100 text-blue-700 rounded-md p-2">
            <Music className="w-12 h-12" />
            <span className="text-sm text-center font-medium mt-2 truncate w-full px-1">{fileDisplayName}</span>
            <span className="text-xs text-center text-blue-500">{fileExtension.toUpperCase()}</span>
            {/* Optionally add an audio element for basic playback controls if space allows, or rely on onView */}
            {/* <audio src={item.secure_url} controls className="w-full mt-2" /> */}
          </div>
        );
      case 'raw': // This often implies documents like PDFs, general files, or even text files
        if (item.mimeType?.includes('application/pdf')) {
          // Use iframe for PDF preview
          return (
            <iframe
              src={item.secure_url}
              title={`PDF preview of ${fileDisplayName}`}
              className="w-full h-full rounded-md border-none"
              sandbox="allow-scripts allow-same-origin allow-popups allow-forms" // Restrict iframe capabilities for security
              loading="lazy" // Defer loading of iframes until they are in the viewport
            >
              <div className="flex flex-col items-center justify-center h-full bg-red-100 text-red-700 rounded-md p-2">
                <FileText className="w-12 h-12" />
                <span className="text-sm text-center font-medium mt-2 truncate w-full px-1">{fileDisplayName}</span>
                <span className="text-xs text-center text-red-500">.PDF</span>
                <p className="text-xs mt-2">Your browser does not support iframes.</p>
              </div>
            </iframe>
          );
        } else if (item.mimeType?.startsWith('text/')) {
          // For text files, show an icon. An iframe might be too small to be useful for content preview.
          return (
            <div className="flex flex-col items-center justify-center h-full bg-green-100 text-green-700 rounded-md p-2">
              <FileText className="w-12 h-12" />
              <span className="text-sm text-center font-medium mt-2 truncate w-full px-1">{fileDisplayName}</span>
              <span className="text-xs text-center text-green-500">{fileExtension.toUpperCase() || 'TEXT'}</span>
            </div>
          );
        }
        // Fallback for other 'raw' types or unknown
      default:
        return (
          <div className="flex flex-col items-center justify-center h-full bg-gray-100 text-gray-700 rounded-md p-2">
            <File className="w-12 h-12" />
            <span className="text-sm text-center font-medium mt-2 truncate w-full px-1">{fileDisplayName}</span>
            <span className="text-xs text-center text-gray-500">{fileExtension.toUpperCase() || 'FILE'}</span>
          </div>
        );
    }
  };

  return (
    <div className={cn("relative w-40   h-44 border border-gray-200 rounded-md shadow-sm overflow-hidden group hover:shadow-lg transition-shadow duration-200 ease-in-out", className)}>
      {renderFileContent()}

      {/* Overlay for actions on hover */}
      <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 ease-in-out">
        <div className="flex gap-2">
          {onView && item.secure_url && (item.resource_type !== 'image' || item.resource_type === 'image') && ( // 'view' for all viewable types
            <button
              onClick={() => onView(item)}
              className="p-2 bg-white rounded-full text-gray-800 hover:bg-gray-200 transition-colors"
              title="View File"
            >
              <Eye className="w-5 h-5" />
            </button>
          )}
          {onDownload && item.secure_url && (
            <button
              onClick={() => onDownload(item)}
              className="p-2 bg-white rounded-full text-gray-800 hover:bg-gray-200 transition-colors"
              title="Download File"
            >
              <Download className="w-5 h-5" />
            </button>
          )}
          {onRemove && (
            <button
              onClick={() => onRemove(item.id)}
              className="p-2 bg-red-500 rounded-full text-white hover:bg-red-600 transition-colors"
              title="Remove File"
            >
              <XCircle className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* File name display, always visible but at the bottom */}
      <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/60 to-transparent text-white text-xs truncate">
        {fileDisplayName}{fileExtension}
      </div>
    </div>
  );
}