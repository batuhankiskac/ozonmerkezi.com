export interface ContentBase {
  id: string;
  title: string;
  imageUrl: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface Article extends ContentBase {
  summary: string;
  content: string;
  citations: string[];
}

export type ArticleSummary = Omit<Article, "content" | "citations">;

export interface Service extends ContentBase {
  description: string;
}

export interface Video extends ContentBase {
  youtubeId: string;
}
