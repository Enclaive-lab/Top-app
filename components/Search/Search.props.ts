import type { ComponentPropsWithoutRef } from "react";

export interface SearchProps extends Omit<ComponentPropsWithoutRef<"form">, "action" | "method"> {
  initialQuery?: string;
}
