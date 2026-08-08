export enum DocumentStatus {
  PENDING = "PENDING",
  PROCESSING = "PROCESSING",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
}

export enum DocumentType {
  PDF = "PDF",
  TXT = "TXT",
  MD = "MD",
  CSV = "CSV",
  JSON = "JSON",
  IMAGE = "IMAGE",
  URL = "URL",
}

export interface DocumentItem {
  id: string;
  notebookId: string; // Keep notebookId for API backwards compatibility, but map to project mentally or update API later
  title: string;
  type: "PDF" | "TXT" | "MD" | "CSV" | "JSON" | "IMAGE" | "URL";
  status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";
  fileUrl?: string;
  url?: string;
  fileSize?: number;
  relativePath?: string;
  errorMessage?: string;
  progress?: number;
  progressMessage?: string;
  studioFeature?: string;
  createdAt: string;
  content?: string;
  viewUrl?: string;
}
