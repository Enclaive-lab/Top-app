import { CoursePage } from "@/components/course/CoursePage";
import { sections } from "@/data/catalog";
import { getApiCatalog } from "@/api/catalog";
export const metadata = { title: sections.course.title };
export default async function Page() {
 const { items, categories } = await getApiCatalog();
 return <CoursePage items={items.filter(item => item.kind === "course")} categories={categories} title={sections.course.title} description={sections.course.description} showCategories />;
}
