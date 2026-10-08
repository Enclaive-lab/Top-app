import { CoursePage } from "@/components/course/CoursePage";
import { sections } from "@/data/catalog";
import { getApiCatalog } from "@/api/catalog";
export const metadata = { title: sections.book.title };
export default async function Page() {
 const { items } = await getApiCatalog();
 return <CoursePage items={items.filter(item => item.kind === "book")} title={sections.book.title} description={sections.book.description}  />;
}
