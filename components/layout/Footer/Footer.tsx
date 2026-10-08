import type { ComponentPropsWithoutRef } from "react";
import Link from "next/link";
import cn from "classnames";
import styles from "./Footer.module.css";

export function Footer({ className, ...props }: ComponentPropsWithoutRef<"footer">) {
  return (
    <footer className={cn(styles.footer, className)} {...props}>
      <Link href="/about">OwlTop © 2026</Link>
      <Link href="/terms">Об использовании сайта</Link>
      <Link href="/privacy">Конфиденциальность</Link>
    </footer>
  );
}
