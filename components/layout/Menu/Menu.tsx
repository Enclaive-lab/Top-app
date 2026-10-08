"use client";
import type { ComponentPropsWithoutRef } from "react";
import { BookOpen, Boxes, Cloud, GraduationCap } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import cn from "classnames";
import type { CatalogCategory, CatalogItem } from "@/data/catalog";
import styles from "./Menu.module.css";
import { motion } from "framer-motion";

export interface CatalogNavigation {
  categories: CatalogCategory[];
  items: Pick<CatalogItem, "slug" | "category" | "kind">[];
}

export function Menu({ navigation, className, ...props }: ComponentPropsWithoutRef<"nav"> & { navigation: CatalogNavigation }) {
  const { categories, items: catalog } = navigation;
  const path = usePathname();
  const variants = {
    visible: {
      marginBottom: 20,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.1,
      },
    },
    hidden: { marginBottom: 0 },
  };
  const item = path.startsWith("/catalog/")
    ? catalog.find((item) => path === `/catalog/${item.slug}`)
    : undefined;
  const activeCategory =
    item?.category ?? (path === "/" ? "photoshop" : path.split("/")[2]);
  const courseActive =
    path === "/" || path.startsWith("/courses") || item?.kind === "course";
  return (
    <nav
      className={cn(styles.menu, className)}
      aria-label="Разделы сайта"
      {...props}
    >
      <motion.ul
        layout
        variants={variants}
        initial={"hidden"}
        className={styles.sections}
      >
        <li>
          <Link
            href="/courses"
            className={cn(styles.section, courseActive && styles.active)}
            aria-current={path === "/courses" ? "page" : undefined}
          >
            <span className={styles.icon}>
              <GraduationCap size={24} strokeWidth={1.8} aria-hidden="true" />
            </span>
            Курсы
          </Link>
          <div className={styles.categories}>
            {Array.from(new Set(categories.map(category => category.group))).map((group) => (
              <div key={group}>
                <div className={styles.category}>{group}</div>
                <ul className={styles.courses}>
                  {categories
                    .filter((category) => category.group === group)
                    .map((category) => (
                      <li key={category.slug}>
                        <Link
                          href={`/courses/${category.slug}`}
                          className={cn(
                            courseActive &&
                              activeCategory === category.slug &&
                              styles.active,
                          )}
                          aria-current={
                            courseActive && activeCategory === category.slug
                              ? "page"
                              : undefined
                          }
                        >
                          {category.name}
                        </Link>
                      </li>
                    ))}
                </ul>
              </div>
            ))}
          </div>
        </li>
        {[
          { href: "/services", title: "Сервисы", Icon: Cloud, kind: "service" },
          { href: "/books", title: "Книги", Icon: BookOpen, kind: "book" },
          { href: "/products", title: "Товары", Icon: Boxes, kind: "product" },
        ].map((section) => (
          <li key={section.href}>
            <Link
              href={section.href}
              className={cn(
                styles.section,
                (path === section.href || item?.kind === section.kind) &&
                  styles.active,
              )}
              aria-current={path === section.href ? "page" : undefined}
            >
              <span className={styles.icon}>
                <section.Icon size={24} strokeWidth={1.8} aria-hidden="true" />
              </span>
              {section.title}
            </Link>
          </li>
        ))}
      </motion.ul>
    </nav>
  );
}
