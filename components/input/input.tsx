import type { InputProps } from "./input.props";
import styles from "./input.module.css";
import cn from "classnames";

export const Input = ({ className, ref, ...props }: InputProps) => {
  return <input ref={ref} className={cn(styles.input, className)} {...props} />;
};
