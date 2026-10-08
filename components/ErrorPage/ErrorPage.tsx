import Link from "next/link";
import { ArrowLeft, ArrowUpRight, BookOpen, Boxes, GraduationCap, Layers, RotateCw } from "lucide-react";
import styles from "./ErrorPage.module.css";

const sections = [
  { href: "/courses", label: "Курсы", icon: GraduationCap },
  { href: "/services", label: "Сервисы", icon: Layers },
  { href: "/books", label: "Книги", icon: BookOpen },
  { href: "/products", label: "Товары", icon: Boxes },
];

export function ErrorPage({ status, retry }: { status: "404" | "500"; retry?: () => void }) {
  const isServerError = status === "500";

  return (
    <section className={styles.card} aria-labelledby="error-page-title">
      <div className={styles.message}>
        <p className={styles.code} aria-label={`Ошибка ${status}`}>{status}</p>
        <h1 id="error-page-title" className={styles.title}>
          {isServerError ? "Не удалось загрузить страницу" : "Страница не найдена"}
        </h1>
        <p className={styles.description}>
          {isServerError
            ? "На сайте произошёл сбой. Попробуйте ещё раз через несколько секунд или вернитесь на главную."
            : "Возможно, ссылка устарела или в адресе есть опечатка. Вернитесь на главную или найдите подходящий курс в каталоге."}
        </p>
        <div className={styles.actions}>
          {isServerError && retry && (
            <button type="button" className={styles.primaryLink} onClick={retry}>
              <RotateCw size={18} aria-hidden="true" />
              Попробовать снова
            </button>
          )}
          <Link href="/" className={isServerError ? styles.secondaryLink : styles.primaryLink}>
            <ArrowLeft size={18} aria-hidden="true" />
            На главную
          </Link>
          {!isServerError && <Link href="/courses" className={styles.secondaryLink}>
            Смотреть курсы
            <ArrowUpRight size={18} aria-hidden="true" />
          </Link>}
        </div>
      </div>

      <nav className={styles.navigation} aria-label="Разделы каталога">
        <p className={styles.navigationTitle}>Или выберите раздел</p>
        <div className={styles.sections}>
          {sections.map(({ href, label, icon: Icon }) => (
            <Link href={href} key={href} className={styles.sectionLink}>
              <Icon size={22} strokeWidth={1.8} aria-hidden="true" />
              <span>{label}</span>
              <ArrowUpRight className={styles.sectionArrow} size={16} aria-hidden="true" />
            </Link>
          ))}
        </div>
      </nav>
    </section>
  );
}
