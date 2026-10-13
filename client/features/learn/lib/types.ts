export type ArtifactType =
  | "SUMMARY"
  | "TAKEAWAYS"
  | "FLASHCARDS"
  | "QUIZ"
  | "MINDMAP"
  | "REPORT";

export type ArtifactStatus = "PENDING" | "PROCESSING" | "READY" | "FAILED";

export type SummaryContent = { markdown: string };

export type TakeawaysContent = { items: string[] };

export type Flashcard = { front: string; back: string };
export type FlashcardsContent = { cards: Flashcard[] };

export type QuizQuestion = {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
};
export type QuizContent = { questions: QuizQuestion[] };

export type MindMapNode = { id: string; label: string };
export type MindMapEdge = { id: string; source: string; target: string };
export type MindMapContent = { nodes: MindMapNode[]; edges: MindMapEdge[] };

export type ReportSection = { title: string; content: string };
export type ReportContent = { markdown: string; sections: ReportSection[] };

export type ArtifactContent =
  | SummaryContent
  | TakeawaysContent
  | FlashcardsContent
  | QuizContent
  | MindMapContent
  | ReportContent;

export type Artifact = {
  id: string;
  workspaceId: string;
  type: ArtifactType;
  title: string;
  content: ArtifactContent | null;
  sourceIds: string[];
  status: ArtifactStatus;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
};

export type CreateArtifactInput = {
  type: ArtifactType;
  title?: string;
  sourceIds?: string[];
};
