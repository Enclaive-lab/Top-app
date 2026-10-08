import type { Metadata } from "next";
import { connection } from "next/server";
import "./globals.css";
import styles from "./layout.module.css";
import { notoSans } from "@/app/fonts";
import { Footer } from "@/components/layout/Footer/Footer";
import { Header } from "@/components/layout/Header/Header";
import { Sidebar } from "@/components/layout/Sidebar/Sidebar";
import { BackToTop } from "@/components/BackToTop/BackToTop";
import { getApiCatalog } from "@/api/catalog";
import type { CatalogNavigation } from "@/components/layout/Menu/Menu";

export const metadata: Metadata = {
  title: { default: "OwlTop — каталог для развития", template: "%s — OwlTop" },
  description: "Курсы, книги и инструменты для творчества и развития. Сравнивайте программы, цены и отзывы с OwlTop.",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await connection();
  let navigation: CatalogNavigation = { categories: [], items: [] };
  try {
    const { categories, items } = await getApiCatalog();
    navigation = { categories, items: items.map(({ slug, category, kind }) => ({ slug, category, kind })) };
  } catch (error) {
    // Keep the shell visible; page requests surface the failure in error.tsx.
    console.error("Catalog navigation unavailable:", error);
  }
  return (
    <html lang="ru">
      <body className={notoSans.className}>
        <div className={styles.wrapper}>
          <Header navigation={navigation} className={styles.header} />
          <Sidebar navigation={navigation} className={styles.sidebar} />
          <main id="main-content" tabIndex={-1} className={styles.body}>{children}</main>
          <Footer className={styles.footer} />
        </div>
        <BackToTop />
      </body>
    </html>
  );
}
