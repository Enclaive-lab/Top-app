import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { Footer } from "@/components/layout/Footer/Footer";
import styles from "./ErrorShell.module.css";

export function ErrorShell({ children }: { children: ReactNode }) {
  return (
    <div className={styles.wrapper}>
      <header className={styles.header}>
        <Link href="/" aria-label="OwlTop — на главную">
          <Image src="/layout/logo.svg" alt="OWL top" width={159} height={43} priority />
        </Link>
        <Link href="/courses" className={styles.catalogLink}>Каталог курсов</Link>
      </header>
      <main className={styles.main}>{children}</main>
      <Footer />
    </div>
  );
}
