import { Search as SearchIcon } from "lucide-react";
import cn from "classnames";
import { Input } from "@/components/input/input";
import type { SearchProps } from "./Search.props";
import styles from "./Search.module.css";

export function Search({ className, initialQuery = "", ...props }: SearchProps) {
  return (
    <form {...props} className={cn(styles.search, className)} action="/search" method="get" role="search">
      <Input key={initialQuery} className={styles.input} type="search" name="q" defaultValue={initialQuery} placeholder="Поиск..." aria-label="Поиск по каталогу" maxLength={200} />
      <button type="submit" aria-label="Найти"><SearchIcon size={18} strokeWidth={2} aria-hidden="true" /></button>
    </form>
  );
}
