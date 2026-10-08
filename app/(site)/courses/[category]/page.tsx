import { notFound } from "next/navigation";
import { CoursePage } from "@/components/course/CoursePage";
import { categories as previousCategories } from "@/data/catalog";
import { getApiCatalog } from "@/api/catalog";
type Props = { params: Promise<{ category: string }> };
export async function generateMetadata({ params }: Props) {
 const { category } = await params;
 const { categories } = await getApiCatalog();
 return { title: [...categories, ...previousCategories].find(item => item.slug === category)?.name ?? "Направление не найдено" };
}
export default async function Page({ params }: Props) {
 const { category } = await params;
 const { items, categories } = await getApiCatalog();
 const data = [...categories, ...previousCategories].find(item => item.slug === category);
 if (!data) notFound();
 return <CoursePage items={items.filter(item => item.kind === "course" && item.category === category)} title={`Курсы: ${data.name}`} description={data.description} editorial={category === "photoshop"} />;
}
