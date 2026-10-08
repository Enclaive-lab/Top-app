import { CoursePage } from "@/components/course/CoursePage";
import { sections } from "@/data/catalog";
import { getApiCatalog } from "@/api/catalog";
export const metadata = { title: sections.service.title };
export default async function Page() {
 const { items } = await getApiCatalog();
 return <CoursePage items={items.filter(item => item.kind === "service")} title={sections.service.title} description={sections.service.description}  />;
}
