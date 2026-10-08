import type { SortValue } from "@/components/Sort/Sort.props";

interface SortableCourse {
  price: number;
  rating: number;
}

export function sortCourses<T extends SortableCourse>(
  courses: readonly T[],
  value: SortValue,
): T[] {
  // Копируем массив: исходный список и его порядок остаются неизменными.
  return [...courses].sort((first, second) => {
    if (value === "price") {
      return first.price - second.price;
    }

    return second.rating - first.rating;
  });
}
