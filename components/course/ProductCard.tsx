"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ChevronRight, Star, UserRound } from "lucide-react";
import { CatalogIcon } from "@/components/icons/CatalogIcon";
import type { CatalogItem, CatalogReview } from "@/data/catalog";
import { formatPrice } from "@/helpers/format-price";
import { pluralize } from "@/helpers/pluralize";
import { ReviewForm } from "./ReviewForm";
import type { SortValue } from "@/components/Sort/Sort";
import styles from "./CoursePage.module.css";

export function Rating({ value }: { value: number }) {
  return <span className={styles.ratingStars} role="img" aria-label={`Оценка ${value} из 5`}>
    {[1, 2, 3, 4, 5].map(star => <span className={styles.ratingStar} key={star}>
      <Star className={styles.starBase} size={20} fill="currentColor" strokeWidth={1.5} aria-hidden="true" />
      <span className={styles.starProgress} style={{ width: `${Math.min(1, Math.max(0, value - star + 1)) * 100}%` }}><Star size={20} fill="currentColor" strokeWidth={1.5} aria-hidden="true" /></span>
    </span>)}
  </span>;
}

export function ProductCard({ product, expanded = false, sortOrder }: { product: CatalogItem; expanded?: boolean; sortOrder?: SortValue }) {
  const [reviews, setReviews] = useState<CatalogReview[]>(product.reviews);
  const reduceMotion = useReducedMotion();
  const count = `${reviews.length} ${pluralize(reviews.length, ["отзыв", "отзыва", "отзывов"])}`;
  return <motion.article
    layout={sortOrder && !reduceMotion ? "position" : false}
    layoutDependency={sortOrder}
    initial={false}
    transition={{ layout: { duration: reduceMotion ? 0 : 0.26, ease: [0.22, 1, 0.36, 1] } }}
    className={styles.courseGroup}
    data-price={product.price}
    data-rating={product.rating}
    aria-labelledby={`title-${product.slug}`}
  >
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        {product.image ? <Image className={styles.school} src={product.image} alt={product.provider} width={70} height={70} /> : <span className={`${styles.providerTile} ${styles[product.tone]}`}><CatalogIcon product={product} /></span>}
        <div className={styles.courseName}>
          <h2 id={`title-${product.slug}`}><Link href={`/catalog/${product.slug}`}>{product.title}</Link></h2>
          <ul className={styles.tags}>{product.tags.map(tag => <li key={tag}>{tag}</li>)}</ul>
        </div>
        <div className={styles.priceBlock}>
          <div className={styles.priceRow}><span>{product.price === 0 ? "Бесплатно" : formatPrice(product.price)}</span>{product.discount > 0 && <span className={styles.discount}>−{formatPrice(product.discount)}</span>}</div>
          <span className={styles.caption}>цена</span>
        </div>
        <div className={styles.credit}>{product.credit ? <><span>{formatPrice(product.credit)}<small>/мес</small></span><span className={styles.caption}>ежемесячный платёж</span></> : <span className={styles.caption}>{product.provider}</span>}</div>
        <div className={styles.rating}><Rating value={product.rating} /><span className={styles.caption}>{product.rating.toFixed(1)} · {count}</span></div>
      </div>
      <p className={styles.description}>{product.description}</p>
      <div className={styles.courseDetails}>
        <dl className={styles.features}>{product.features.map(([name, value]) => <div key={name}><dt>{name}</dt><span aria-hidden="true" /><dd>{value}</dd></div>)}</dl>
        {(product.advantages || product.disadvantages) && <div className={styles.prosCons}>
          {product.advantages && <div className={styles.pros}><h3>Преимущества</h3><p>{product.advantages}</p></div>}
          {product.disadvantages && <div className={styles.cons}><h3>На что обратить внимание</h3><p>{product.disadvantages}</p></div>}
        </div>}
      </div>
      {!expanded && <div className={styles.actions}><Link className={styles.primaryButton} href={`/catalog/${product.slug}`}>Узнать подробнее</Link><Link className={styles.secondaryButton} href={`/catalog/${product.slug}#reviews-${product.slug}`}>Читать отзывы<ChevronRight size={16} aria-hidden="true" /></Link></div>}
    </div>
    {expanded && <section className={styles.reviews} id={`reviews-${product.slug}`} aria-label="Отзывы">
      <h2 className={styles.reviewsTitle}>Отзывы <span className={styles.caption}>{count}</span></h2>
      {reviews.map(review => <article className={styles.review} key={review.id}>
        <div className={styles.reviewHeader}><span className={styles.reviewAvatar}><UserRound size={19} aria-hidden="true" /></span><p className={styles.reviewAuthor}><strong>{review.name}</strong><span>{review.title}</span></p><time dateTime={review.date}>{new Date(`${review.date}T12:00:00Z`).toLocaleDateString("ru-RU", { timeZone: "UTC" })}</time><Rating value={review.rating} /></div>
        <p className={styles.reviewText}>{review.text}</p>
      </article>)}
      <ReviewForm apiProductId={product.apiProductId} onAdd={review => setReviews(current => [...current, review])} />
    </section>}
  </motion.article>;
}
