import type { ComponentPropsWithoutRef } from "react";
import Image from "next/image";
import Link from "next/link";
import cn from "classnames";
import { Menu, type CatalogNavigation } from "../Menu/Menu";
import { Search } from "@/components/Search/Search";
import styles from "./Sidebar.module.css";

export function Sidebar({ navigation, className, ...props }: ComponentPropsWithoutRef<"aside"> & { navigation: CatalogNavigation }) {
  return (
    <aside className={cn(styles.sidebar, className)} {...props}>
      <Link href="/" className={styles.logo} aria-label="На главную">
        <Image src="/layout/logo.svg" alt="OWL top" width={159} height={43} priority />
      </Link>
      <Search className={styles.search} />
      <Menu navigation={navigation} />
    </aside>
  );
}
