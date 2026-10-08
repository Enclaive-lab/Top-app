import { Search } from "@/components/Search/Search";
import { CoursePage } from "@/components/course/CoursePage";
import { filterCatalog, getApiCatalog } from "@/api/catalog";
import styles from "@/components/course/CoursePage.module.css";
export const metadata = { title: "Поиск по каталогу" };
export default async function Page({ searchParams }: { searchParams: Promise<{ q?: string | string[] }> }) {
 const params = await searchParams;
 const query = (Array.isArray(params.q) ? params.q[0] : params.q ?? "").trim().slice(0,200);
 const { items } = await getApiCatalog();
 return <><Search className={styles.searchBox} initialQuery={query} /><CoursePage key={query} items={filterCatalog(items, query)} title={query ? `Результаты: «${query}»` : "Поиск по каталогу"} description={query ? "Курсы, книги, сервисы и товары, подходящие под ваш запрос." : "Введите название или тему. Например: TypeScript, Next.js или Go."} /></>;
}
