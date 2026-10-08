import { CoursePage } from "@/components/course/CoursePage";
import { sections } from "@/data/catalog";
import { getApiCatalog } from "@/api/catalog";
export const metadata = { title: sections.product.title };
export default async function Page() {
 const { items } = await getApiCatalog();
 return <CoursePage items={items.filter(item => item.kind === "product")} title={sections.product.title} description={sections.product.description}  />;
}
