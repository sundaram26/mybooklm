export interface Project {
  id: string;
  title: string;
  description?: string | null;
  userId?: string | null;
  guestId?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectWithCounts extends Project {
  _count?: {
    documents: number;
    messages: number;
  };
  documents?: any[]; // Will type this fully in document.types.ts later if needed, or import DocumentItem
}
