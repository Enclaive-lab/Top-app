import type { Metadata } from "next";
import { CoursePage } from "@/components/course/CoursePage";
import { getApiCatalog } from "@/api/catalog";

export const metadata: Metadata = {
  title: "Курсы по Photoshop",
  description: "Курсы по Photoshop: цены, программы, отзывы и навыки дизайнера.",
};

export default async function Home() {
  const { items, categories } = await getApiCatalog();
  return <CoursePage items={items.filter(item => item.kind === "course" && item.category === "photoshop")} categories={categories} title="Курсы по Photoshop" description="Ретушь, коллажи и работа с изображениями. Курсы для первых шагов и уверенного роста в дизайне." editorial />;
}
