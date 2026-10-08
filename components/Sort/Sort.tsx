"use client";

import cn from "classnames";
import { useId } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowDownWideNarrow, ListFilter } from "lucide-react";
import type { SortProps, SortValue } from "./Sort.props";
import styles from "./Sort.module.css";

export type { SortProps, SortValue } from "./Sort.props";

const options: { value: SortValue; label: string }[] = [
  { value: "rating", label: "По рейтингу" },
  { value: "price", label: "По цене" },
];

export function Sort({ value, onChange, className, ...props }: SortProps) {
  const indicatorId = useId();
  const reduceMotion = useReducedMotion();
  return (
    <div
      role="group"
      aria-label="Сортировка курсов"
      {...props}
      className={cn(styles.sort, className)}
    >
      {options.map((option) => (
        <button
          key={option.value}
          className={cn(styles.option, {
            [styles.active]: value === option.value,
          })}
          type="button"
          aria-pressed={value === option.value}
          onClick={() => onChange(option.value)}
        >
          <span className={styles.icon} aria-hidden="true">
            {option.value === "price" ? <ArrowDownWideNarrow size={20} /> : <ListFilter size={20} />}
          </span>
          {option.label}
          {value === option.value && <motion.span
            className={styles.indicator}
            layoutId={`${indicatorId}-sort`}
            initial={false}
            transition={{ duration: reduceMotion ? 0 : 0.2, ease: "easeOut" }}
            aria-hidden="true"
          />}
        </button>
      ))}
    </div>
  );
}
