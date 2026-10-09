export type SourceType = "PDF" | "WEBSITE" | "YOUTUBE" | "TEXT" | "MARKDOWN";

export type SourceStatus = "PENDING" | "PROCESSING" | "READY" | "FAILED";

export type Source = {
  id: string;
  workspaceId: string;
  type: SourceType | "PDF" | "WEBSITE" | "YOUTUBE";
  title: string;
  content: string | null;
  url: string | null;
  status: SourceStatus;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
};

export type SourceFilters = {
  q?: string;
  type?: SourceType;
  status?: SourceStatus;
};

export type CreateSourceInput =
  | {
      type: "TEXT";
      title: string;
      content: string;
    }
  | {
      type: "MARKDOWN";
      title: string;
      content: string;
    };

export type ImportWebsiteInput = {
  url: string;
  title?: string;
};

export type ImportYoutubeInput = {
  url: string;
  title?: string;
};
