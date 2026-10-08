import type { Metadata } from "next";
import { ErrorPage } from "@/components/ErrorPage/ErrorPage";
import { ErrorShell } from "@/components/ErrorPage/ErrorShell";
import { notoSans } from "./fonts";
import "./(site)/globals.css";

export const metadata: Metadata = {
  title: "Страница не найдена — OwlTop",
  description: "Вернитесь на главную OwlTop или выберите курсы, сервисы, книги и товары в каталоге.",
};

export default function GlobalNotFound() {
  return (
    <html lang="ru">
      <body className={notoSans.className}>
        <ErrorShell><ErrorPage status="404" /></ErrorShell>
      </body>
    </html>
  );
}
