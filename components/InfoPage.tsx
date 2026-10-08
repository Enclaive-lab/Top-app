import Link from "next/link";
import type { ReactNode } from "react";
import styles from "@/components/course/CoursePage.module.css";
export function InfoPage({ title, children }: { title: string; children: ReactNode }) {
 return <div><nav className={styles.breadcrumbs}><Link href="/">Главная</Link><span>/</span><span>{title}</span></nav><p className={styles.eyebrow}>OWL TOP</p><h1 className={styles.detailTitle}>{title}</h1><article className={styles.infoPanel}>{children}</article><div className={styles.categoryLinks}><Link href="/courses">Смотреть курсы</Link><Link href="/about">Об OwlTop</Link><Link href="/privacy">Конфиденциальность</Link></div></div>;
}
