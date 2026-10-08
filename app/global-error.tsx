"use client";

import { ErrorShell } from "@/components/ErrorPage/ErrorShell";
import ServerError from "@/components/ErrorPage/ServerError";
import { notoSans } from "./fonts";
import "./(site)/globals.css";

export default function GlobalError({ retry }: { retry: () => void }) {
  return (
    <html lang="ru">
      <body className={notoSans.className}>
        <title>Ошибка сервера — OwlTop</title>
        <ErrorShell><ServerError retry={retry} /></ErrorShell>
      </body>
    </html>
  );
}
