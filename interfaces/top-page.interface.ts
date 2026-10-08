import type { TopLevelCategory } from "./page.interface";

export interface TopPageAdvantage {
  title: string;
  description: string;
}

export interface TopPageModel {
  _id: number;
  firstCategory: TopLevelCategory;
  secondCategory: string;
  alias: string;
  title: string;
  metaTitle: string;
  metaDescription: string;
  category: string;
  advantages: TopPageAdvantage[];
  seoText: string;
  tagsTitle: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}
