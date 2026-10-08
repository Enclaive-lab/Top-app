import type { ComponentPropsWithoutRef } from "react";

export type SortValue = "rating" | "price";

export interface SortProps extends Omit<ComponentPropsWithoutRef<"div">, "onChange"> {
  value: SortValue;
  onChange: (value: SortValue) => void;
}
