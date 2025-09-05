import {
  AttachmentAdapter,
  PendingAttachment,
  CompleteAttachment,
} from "@assistant-ui/react";

interface DocumentTypeConfig {
  maxSize: number;
  category: "document" | "image" | "text" | "spreadsheet" | "presentation" | "archive";
  description: string;
}

class UniversalAttachmentAdapter implements AttachmentAdapter {
  // Define supported file types with their configurations
  private readonly supportedTypes: Record<string, DocumentTypeConfig> = {
    // PDF Documents
    "application/pdf": {
      maxSize: 100 * 1024 * 1024, // 100MB
      category: "document",
      description: "PDF Document"
    },
    
    // Microsoft Office Documents
    "application/msword": {
      maxSize: 50 * 1024 * 1024, // 50MB
      category: "document",
      description: "Word Document (.doc)"
    },
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": {
      maxSize: 50 * 1024 * 1024, // 50MB
      category: "document",
      description: "Word Document (.docx)"
    },
    "application/vnd.ms-excel": {
      maxSize: 50 * 1024 * 1024, // 50MB
      category: "spreadsheet",
      description: "Excel Spreadsheet (.xls)"
    },
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": {
      maxSize: 50 * 1024 * 1024, // 50MB
      category: "spreadsheet",
      description: "Excel Spreadsheet (.xlsx)"
    },
    "application/vnd.ms-powerpoint": {
      maxSize: 100 * 1024 * 1024, // 100MB
      category: "presentation",
      description: "PowerPoint Presentation (.ppt)"
    },
    "application/vnd.openxmlformats-officedocument.presentationml.presentation": {
      maxSize: 100 * 1024 * 1024, // 100MB
      category: "presentation",
      description: "PowerPoint Presentation (.pptx)"
    },
    
    // Text Files
    "text/plain": {
      maxSize: 10 * 1024 * 1024, // 10MB
      category: "text",
      description: "Text File"
    },
    "text/csv": {
      maxSize: 50 * 1024 * 1024, // 50MB
      category: "spreadsheet",
      description: "CSV File"
    },
    "application/json": {
      maxSize: 10 * 1024 * 1024, // 10MB
      category: "text",
      description: "JSON File"
    },
    "application/xml": {
      maxSize: 10 * 1024 * 1024, // 10MB
      category: "text",
      description: "XML File"
    },
    "text/xml": {
      maxSize: 10 * 1024 * 1024, // 10MB
      category: "text",
      description: "XML File"
    },
    
    // Rich Text Format
    "application/rtf": {
      maxSize: 25 * 1024 * 1024, // 25MB
      category: "document",
      description: "Rich Text Format"
    },
    
    // OpenDocument Formats
    "application/vnd.oasis.opendocument.text": {
      maxSize: 50 * 1024 * 1024, // 50MB
      category: "document",
      description: "OpenDocument Text (.odt)"
    },
    "application/vnd.oasis.opendocument.spreadsheet": {
      maxSize: 50 * 1024 * 1024, // 50MB
      category: "spreadsheet",
      description: "OpenDocument Spreadsheet (.ods)"
    },
    "application/vnd.oasis.opendocument.presentation": {
      maxSize: 100 * 1024 * 1024, // 100MB
      category: "presentation",
      description: "OpenDocument Presentation (.odp)"
    },
    
    // Images
    "image/jpeg": {
      maxSize: 25 * 1024 * 1024, // 25MB
      category: "image",
      description: "JPEG Image"
    },
    "image/jpg": {
      maxSize: 25 * 1024 * 1024, // 25MB
      category: "image",
      description: "JPG Image"
    },
    "image/png": {
      maxSize: 25 * 1024 * 1024, // 25MB
      category: "image",
      description: "PNG Image"
    },
    "image/gif": {
      maxSize: 25 * 1024 * 1024, // 25MB
      category: "image",
      description: "GIF Image"
    },
    "image/webp": {
      maxSize: 25 * 1024 * 1024, // 25MB
      category: "image",
      description: "WebP Image"
    },
    "image/svg+xml": {
      maxSize: 5 * 1024 * 1024, // 5MB
      category: "image",
      description: "SVG Image"
    },
    "image/tiff": {
      maxSize: 50 * 1024 * 1024, // 50MB
      category: "image",
      description: "TIFF Image"
    },
    "image/bmp": {
      maxSize: 25 * 1024 * 1024, // 25MB
      category: "image",
      description: "BMP Image"
    },
    
    // Code Files
    "text/javascript": {
      maxSize: 5 * 1024 * 1024, // 5MB
      category: "text",
      description: "JavaScript File"
    },
    "text/typescript": {
      maxSize: 5 * 1024 * 1024, // 5MB
      category: "text",
      description: "TypeScript File"
    },
    "text/html": {
      maxSize: 10 * 1024 * 1024, // 10MB
      category: "text",
      description: "HTML File"
    },
    "text/css": {
      maxSize: 5 * 1024 * 1024, // 5MB
      category: "text",
      description: "CSS File"
    },
    "application/javascript": {
      maxSize: 5 * 1024 * 1024, // 5MB
      category: "text",
      description: "JavaScript File"
    },
    
    // Archive Files
    "application/zip": {
      maxSize: 100 * 1024 * 1024, // 100MB
      category: "archive",
      description: "ZIP Archive"
    },
    "application/x-rar-compressed": {
      maxSize: 100 * 1024 * 1024, // 100MB
      category: "archive",
      description: "RAR Archive"
    },
    "application/x-7z-compressed": {
      maxSize: 100 * 1024 * 1024, // 100MB
      category: "archive",
      description: "7Z Archive"
    },
    "application/gzip": {
      maxSize: 100 * 1024 * 1024, // 100MB
      category: "archive",
      description: "GZIP Archive"
    },
    "application/x-tar": {
      maxSize: 100 * 1024 * 1024, // 100MB
      category: "archive",
      description: "TAR Archive"
    }
  };

  // Create accept string from all supported types
  accept = Object.keys(this.supportedTypes).join(",");

  async add({ file }: { file: File }): Promise<PendingAttachment> {
    const config = this.supportedTypes[file.type];
    
    if (!config) {
      throw new Error(`Loại tập tin không được hỗ trợ: ${file.type}`);
    }

    if (file.size > config.maxSize) {
      const maxSizeMB = Math.round(config.maxSize / (1024 * 1024));
      throw new Error(`Kích thước ${config.description} vượt quá giới hạn ${maxSizeMB}MB`);
    }

    if (file.size === 0) {
      throw new Error("Tập tin trống");
    }

    return {
      id: crypto.randomUUID(),
      type: this.getAttachmentType(config.category),
      name: file.name,
      file,
      contentType: file.type,
      status: { 
        type: "running", 
        reason: "uploading", 
        progress: 0 
      },
    };
  }

  async send(attachment: PendingAttachment): Promise<CompleteAttachment> {
    try {
      // Convert all files to base64
      const base64Data = await this.fileToBase64(attachment.file);

      return {
        id: attachment.id,
        type: attachment.type,
        name: attachment.name,
        contentType: attachment.contentType,
        content: [
          {
            type: "text",
            text: base64Data,
          },
        ],
        status: { type: "complete" },
      };
    } catch (error) {
      throw new Error(`Không thể xử lý ${attachment.name}: ${error instanceof Error ? error.message : 'Lỗi không xác định'}`);
    }
  }

  async remove(attachment: PendingAttachment): Promise<void> {
    // Cleanup logic if needed (e.g., cancel uploads, clean temp files)
    // For now, this is a no-op as we don't have persistent storage
  }

  // Helper method to determine attachment type based on category
  private getAttachmentType(category: string): "document" | "image" | "file" {
    switch (category) {
      case "image":
        return "image";
      case "text":
        return "file";
      default:
        return "document";
    }
  }

  // Convert file to base64
  private async fileToBase64(file: File): Promise<string> {
    const arrayBuffer = await file.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);
    let binary = "";
    bytes.forEach((byte) => {
      binary += String.fromCharCode(byte);
    });
    return btoa(binary);
  }

  // Get supported file extensions for display purposes
  getSupportedExtensions(): string[] {
    const extensions: string[] = [];
    const mimeToExt: Record<string, string[]> = {
      "application/pdf": [".pdf"],
      "application/msword": [".doc"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
      "application/vnd.ms-excel": [".xls"],
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
      "application/vnd.ms-powerpoint": [".ppt"],
      "application/vnd.openxmlformats-officedocument.presentationml.presentation": [".pptx"],
      "text/plain": [".txt"],
      "text/csv": [".csv"],
      "application/json": [".json"],
      "application/xml": [".xml"],
      "text/xml": [".xml"],
      "application/rtf": [".rtf"],
      "application/vnd.oasis.opendocument.text": [".odt"],
      "application/vnd.oasis.opendocument.spreadsheet": [".ods"],
      "application/vnd.oasis.opendocument.presentation": [".odp"],
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"],
      "image/gif": [".gif"],
      "image/webp": [".webp"],
      "image/svg+xml": [".svg"],
      "image/tiff": [".tiff", ".tif"],
      "image/bmp": [".bmp"],
      "text/javascript": [".js"],
      "text/typescript": [".ts"],
      "text/html": [".html", ".htm"],
      "text/css": [".css"],
      "application/zip": [".zip"],
      "application/x-rar-compressed": [".rar"],
      "application/x-7z-compressed": [".7z"],
      "application/gzip": [".gz"],
      "application/x-tar": [".tar"]
    };

    Object.entries(mimeToExt).forEach(([mimeType, exts]) => {
      if (this.supportedTypes[mimeType]) {
        extensions.push(...exts);
      }
    });

    return extensions.sort();
  }

  // Get file type information
  getFileTypeInfo(contentType: string): DocumentTypeConfig | null {
    return this.supportedTypes[contentType] || null;
  }
}

export default UniversalAttachmentAdapter;