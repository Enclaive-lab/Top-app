import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductCard } from "@/components/course/ProductCard";
import { sections } from "@/data/catalog";
import { getApiCatalog } from "@/api/catalog";
import styles from "@/components/course/CoursePage.module.css";
type Props = { params: Promise<{ slug: string }> };
export async function generateMetadata({ params }: Props) {
 const { slug } = await params;
 const { items: catalog } = await getApiCatalog();
 const item = catalog.find(item => item.slug === slug);
 return { title: item?.title ?? "Не найдено", description: item?.description };
}
export default async function Page({ params }: Props) {
 const { slug } = await params;
 const { items: catalog, categories } = await getApiCatalog();
 const item = catalog.find(item => item.slug === slug);
 if (!item) notFound();
 const section = sections[item.kind];
 const category = categories.find(category => category.slug === item.category);
 const related = catalog.filter(other => other.slug !== slug && other.kind === item.kind).sort((a,b) => Number(b.category === item.category) - Number(a.category === item.category)).slice(0,2);
 return <div>
  <nav className={styles.breadcrumbs} aria-label="Хлебные крошки"><Link href="/">Главная</Link><span>/</span><Link href={section.href}>{section.title}</Link>{category && <><span>/</span><Link href={`/courses/${category.slug}`}>{category.name}</Link></>}</nav>
  <p className={styles.eyebrow}>ПОДРОБНЕЕ / {item.provider}</p>
  <h1 className={styles.detailTitle}>{item.title}</h1>
  <ProductCard key={item.slug} product={item} expanded />
  {item.modules.length > 0 && <section className={styles.infoPanel}><h2>{item.kind === "course" ? "Программа обучения" : item.kind === "book" ? "Что внутри" : "Возможности и детали"}</h2><ol className={styles.moduleList}>{item.modules.map(module => <li key={module}>{module}</li>)}</ol></section>}
  <h2 className={styles.relatedTitle}>Посмотрите также</h2>
  <div className={styles.productList}>{related.map(product => <ProductCard key={product.slug} product={product} />)}</div>
 </div>;
}
