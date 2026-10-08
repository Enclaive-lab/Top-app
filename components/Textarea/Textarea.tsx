import cn from "classnames";
import type { TextareaProps } from "./Textarea.props";
import styles from "./Textarea.module.css";

export const Textarea = ({ className, ref, ...props }: TextareaProps) => {
  return <textarea ref={ref} className={cn(styles.textarea, className)} {...props} />;
};
