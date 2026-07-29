import { axiosClient, API_BASE } from "./axios-client";


export interface DocumentItem {
  id: string;
  notebookId: string;
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
}

export const documentsApi = {
  async getDocuments(notebookId: string): Promise<DocumentItem[]> {
    const response = await axiosClient.get(`/notebooks/${notebookId}/documents`);
    return response.data?.data || [];
  },

  async uploadFile(notebookId: string, file: File): Promise<DocumentItem> {
    const formData = new FormData();
    const isImage = file.type.startsWith("image/");
    const endpoint = isImage ? "image" : "file";
    formData.append(endpoint, file);
    if (file.webkitRelativePath) {
      formData.append("relativePath", file.webkitRelativePath);
    }

    try {
      const response = await axiosClient.post(
        `/notebooks/${notebookId}/documents/${endpoint}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return response.data?.data;
    } catch (err: any) {
      const msg = err.response?.data?.message || `Failed to upload ${endpoint}`;
      throw new Error(msg);
    }
  },

  async uploadUrl(notebookId: string, url: string, title?: string): Promise<DocumentItem> {
    try {
      const response = await axiosClient.post(`/notebooks/${notebookId}/documents/link`, {
        url,
        title,
      });
      return response.data?.data;
    } catch (err: any) {
      const msg = err.response?.data?.message || "Failed to ingest URL";
      throw new Error(msg);
    }
  },

  async createTextNote(notebookId: string, text: string, title: string): Promise<DocumentItem> {
    try {
      const response = await axiosClient.post(`/notebooks/${notebookId}/documents/text`, {
        content: text,
        title,
      });
      return response.data?.data;
    } catch (err: any) {
      const msg = err.response?.data?.message || "Failed to create text note";
      throw new Error(msg);
    }
  },

  async getDocumentStatus(
    notebookId: string,
    documentId: string
  ): Promise<{ status: string; errorMessage?: string; progress?: number; progressMessage?: string }> {
    const response = await axiosClient.get(`/notebooks/${notebookId}/documents/${documentId}/status`);
    return response.data?.data;
  },

  async getDocument(documentId: string): Promise<DocumentItem & { content?: string; viewUrl?: string }> {
    const response = await axiosClient.get(`/notebooks/documents/${documentId}`);
    return response.data?.data;
  },

  async deleteDocument(notebookId: string, documentId: string): Promise<void> {
    await axiosClient.delete(`/notebooks/${notebookId}/documents/${documentId}`);
  },

  async generateStudioOutput(
    notebookId: string,
    feature: string,
    options?: { customParams?: Record<string, any> }
  ): Promise<DocumentItem> {
    try {
      const response = await axiosClient.post(`/notebooks/${notebookId}/studio`, {
        feature,
        customParams: options?.customParams,
      });
      return response.data?.data;
    } catch (err: any) {
      const msg = err.response?.data?.message || "Failed to generate studio output";
      throw new Error(msg);
    }
  },

  getDocumentFileProxyUrl(notebookId: string, documentId: string): string {
    return `${API_BASE}/api/notebooks/documents/${documentId}/view`;
  },
};
