"use client";
import type { ComponentPropsWithoutRef } from "react";
import Image from "next/image";
import { Menu as MenuIcon, X } from "lucide-react";
import Link from "next/link";
import cn from "classnames";
import styles from "./Header.module.css";
import { Menu, type CatalogNavigation } from "../Menu/Menu";
import { Search } from "@/components/Search/Search";

export function Header({ navigation, className, ...props }: ComponentPropsWithoutRef<"header"> & { navigation: CatalogNavigation }) {
  return (
    <header className={cn(styles.header, className)} {...props}>
      <Link href="/" aria-label="На главную">
        <Image src="/layout/logo.svg" alt="OWL top" width={159} height={43} priority />
      </Link>
      <details className={styles.mobileMenu} onKeyDown={event => { if (event.key === "Escape") { event.currentTarget.open = false; event.currentTarget.querySelector("summary")?.focus(); } }}>
        <summary className={styles.menuButton} aria-label="Открыть меню"><MenuIcon className={styles.menuOpenIcon} size={24} aria-hidden="true" /><X className={styles.menuCloseIcon} size={24} aria-hidden="true" /></summary>
        <div className={styles.panel} onClick={event => { if ((event.target as HTMLElement).closest("a")) event.currentTarget.closest("details")?.removeAttribute("open"); }}><Search className={styles.search} /><Menu navigation={navigation} /></div>
      </details>
    </header>
  );
}
