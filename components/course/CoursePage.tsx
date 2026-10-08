"use client";

import { useState } from "react";
import { Check, CircleStar } from "lucide-react";
import Link from "next/link";
import { Sort, type SortValue } from "@/components/Sort/Sort";
import { sortCourses } from "@/helpers/sort-courses";
import { formatPrice } from "@/helpers/format-price";
import type { CatalogCategory, CatalogItem } from "@/data/catalog";
import { benefits, salaries, skills } from "./course-data";
import { ProductCard } from "./ProductCard";
import styles from "./CoursePage.module.css";

function Vacancies() {
  return (
    <section className={styles.vacancies} aria-labelledby="vacancies-title">
      <div className={styles.sectionHeading}><h2 id="vacancies-title">Вакансии — Photoshop</h2><span className={styles.hh}>hh.ru</span></div>
      <div className={styles.jobs}>
        <div className={styles.jobCount}><h3>Всего вакансий</h3><strong>{formatPrice(1210).replace(" ₽", "")}</strong></div>
        <div className={styles.salaries}>
          {salaries.map((salary) => (
            <div className={styles.salary} key={salary.title}>
              <h3>{salary.title}</h3><strong>{formatPrice(salary.amount)}</strong>
              <div className={styles.salaryRating} aria-label={`Уровень ${salary.level} из 3`}>
                {[1, 2, 3].map((level) => <CircleStar key={level} size={20} className={level <= salary.level ? styles.salaryActive : styles.salaryMuted} aria-hidden="true" />)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Benefits() {
  return (
    <section className={styles.benefits} id="benefits" aria-labelledby="benefits-title">
      <h2 id="benefits-title">Преимущества</h2>
      <ul className={styles.benefitList}>
        {benefits.map((benefit) => (
          <li className={styles.benefit} key={benefit.title}>
            <span className={styles.benefitIcon}>
              <Check size={26} strokeWidth={2.5} aria-hidden="true" />
            </span>
            <div><h3>{benefit.title}</h3><p>{benefit.text}</p></div>
          </li>
        ))}
      </ul>
      <p className={styles.summary}>При завершении очередного проекта над графикой, специалист всегда задает себе вопрос о дальнейших перспективах. Отличие профессиональных дизайнеров заключается в том, что они гибкие. Сегодня разрабатывается логотип новой компании, а завтра вполне можно переключиться на иллюстрацию культовой книги.</p>
    </section>
  );
}


export function CoursePage({ items, categories = [], title = "Все курсы", description = "Выберите программу обучения.", editorial = false, showCategories = false }: { items: CatalogItem[]; categories?: CatalogCategory[]; title?: string; description?: string; editorial?: boolean; showCategories?: boolean }) {
  const [sort, setSort] = useState<SortValue>("rating");
  const products = sortCourses(items, sort);
  return <div className={styles.page}>
    <p className={styles.eyebrow}>OWL TOP / КАТАЛОГ</p>
    <div className={styles.pageHeading}>
      <div className={styles.title}><h1>{title}</h1><span className={styles.count} aria-label={`Найдено: ${products.length}`}>{products.length}</span></div>
      {products.length > 1 && <Sort value={sort} onChange={setSort} />}
    </div>
    <p className={styles.intro}>{description}</p>
    {showCategories && <nav className={styles.categoryLinks} aria-label="Направления обучения">{categories.map(category => <Link key={category.slug} href={`/courses/${category.slug}`}>{category.name}</Link>)}</nav>}
    <div className={styles.productList}>{products.map(product => <ProductCard key={product.slug} product={product} sortOrder={sort} />)}</div>
    {!products.length && <div className={styles.emptyState}><h2>Пока ничего не найдено</h2><p>Попробуйте другое название или выберите направление в каталоге.</p><Link className={styles.primaryButton} href="/courses">Все курсы</Link></div>}
    {editorial && <><Vacancies /><Benefits /><section className={styles.skills} aria-labelledby="skills-title"><h2 id="skills-title">Получаемые навыки</h2><ul className={styles.skillTags}>{skills.map(skill => <li key={skill}>{skill}</li>)}</ul></section></>}
  </div>;
}
