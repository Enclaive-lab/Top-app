"use client";

import { useId, useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { Star } from "lucide-react";
import { Textarea } from "@/components/Textarea/Textarea";
import { Input } from "@/components/input/input";
import type { CatalogReview } from "@/data/catalog";
import styles from "./CoursePage.module.css";

interface ReviewFormValues {
  name: string;
  title: string;
  text: string;
  rating: string;
}

export function ReviewForm({ onAdd, apiProductId }: { onAdd: (review: CatalogReview) => void; apiProductId?: string }) {
  const formId = useId();
  const [message, setMessage] = useState("");
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<ReviewFormValues>({
    defaultValues: { name: "", title: "", text: "", rating: "" },
    mode: "onSubmit",
    reValidateMode: "onChange",
    shouldFocusError: true,
  });

  const onSubmit: SubmitHandler<ReviewFormValues> = async (values) => {
    const review: CatalogReview = {
      id: crypto.randomUUID(),
      name: values.name.trim(),
      title: values.title.trim(),
      text: values.text.trim(),
      rating: Number(values.rating),
      date: new Date().toISOString().slice(0, 10),
    };
    try {
      if (apiProductId) {
        const response = await fetch("/api/catalog/reviews", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId: apiProductId, ...review }),
        });
        if (!response.ok) throw new Error("Не удалось сохранить отзыв. Попробуйте ещё раз.");
        const saved = await response.json() as CatalogReview;
        onAdd(saved);
      } else {
        onAdd(review);
      }
    } catch {
      setMessage("Не удалось сохранить отзыв. Попробуйте ещё раз — заполненные поля сохранены.");
      return;
    }
    reset();
    setMessage("Спасибо! Ваш отзыв добавлен.");
  };

  return (
    <form className={styles.reviewForm} noValidate aria-busy={isSubmitting} onSubmit={handleSubmit(onSubmit, () => setMessage(""))} onInput={() => { if (message) setMessage(""); }}>
      <div className={styles.formTop}>
        <div className={styles.formField}>
          <Input
            {...register("name", { required: "Введите имя", validate: value => value.trim().length > 0 || "Введите имя", maxLength: { value: 100, message: "Имя — не больше 100 символов" } })}
            placeholder="Имя" aria-label="Ваше имя" autoComplete="name" required maxLength={100}
            aria-invalid={Boolean(errors.name)} aria-describedby={errors.name ? `${formId}-name-error` : undefined}
          />
          {errors.name && <p className={styles.fieldError} id={`${formId}-name-error`} role="alert">{errors.name.message}</p>}
        </div>
        <div className={styles.formField}>
          <Input
            {...register("title", { required: "Введите заголовок отзыва", validate: value => value.trim().length >= 3 || "Заголовок — минимум 3 символа", maxLength: { value: 200, message: "Заголовок — не больше 200 символов" } })}
            placeholder="Заголовок отзыва" aria-label="Заголовок отзыва" required maxLength={200}
            aria-invalid={Boolean(errors.title)} aria-describedby={errors.title ? `${formId}-title-error` : undefined}
          />
          {errors.title && <p className={styles.fieldError} id={`${formId}-title-error`} role="alert">{errors.title.message}</p>}
        </div>
        <div className={styles.ratingControl}>
        <fieldset className={styles.ratingField} aria-invalid={Boolean(errors.rating)} aria-describedby={errors.rating ? `${formId}-rating-error` : undefined}>
          <legend>Оценка:</legend>
          <div className={styles.starChoices}>
            {[1, 2, 3, 4, 5].map((value) => (
              <label className={styles.starChoice} key={value}>
                <input {...register("rating", { required: "Выберите оценку от 1 до 5", validate: value => ["1", "2", "3", "4", "5"].includes(value) || "Выберите оценку от 1 до 5" })} type="radio" value={value} aria-label={`Оценка ${value} из 5`} required aria-describedby={errors.rating ? `${formId}-rating-error` : undefined} />
                <span className={styles.starEmpty}><Star size={20} fill="currentColor" strokeWidth={1.5} aria-hidden="true" /></span>
                <span className={styles.starFilled}><Star size={20} fill="currentColor" strokeWidth={1.5} aria-hidden="true" /></span>
              </label>
            ))}
          </div>
        </fieldset>
        {errors.rating && <p className={styles.fieldError} id={`${formId}-rating-error`} role="alert">{errors.rating.message}</p>}
        </div>
      </div>
      <div className={styles.reviewTextarea}>
      <Textarea
        {...register("text", { required: "Напишите текст отзыва", validate: value => value.trim().length >= 10 || "Расскажите подробнее — минимум 10 символов", maxLength: { value: 5000, message: "Отзыв — не больше 5000 символов" } })}
        placeholder="Текст отзыва"
        aria-label="Текст отзыва"
        required
        maxLength={5000}
        aria-invalid={Boolean(errors.text)}
        aria-describedby={errors.text ? `${formId}-text-error` : undefined}
      />
      {errors.text && <p className={styles.fieldError} id={`${formId}-text-error`} role="alert">{errors.text.message}</p>}
      </div>
      <div className={styles.formBottom}><button className={styles.primaryButton} type="submit" disabled={isSubmitting}>{isSubmitting ? "Добавляем…" : "Добавить отзыв"}</button><p>Поделитесь своим опытом — помогите другим сделать выбор.</p></div>
      <p className={styles.formMessage} role="status">{message}</p>
    </form>
  );
}
