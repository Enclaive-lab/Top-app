# OwlTop

Каталог курсов, книг, сервисов и товаров для творчества и профессионального развития. Next.js App Router, React, TypeScript, React Hook Form, CSS Modules и Lucide.

## Commands

Перед первым запуском установите зависимости через `npm ci` и скопируйте `.env.example` в `.env`. Запустите отдельный Top API на порту `3000`, затем `npm run dev`.

```bash
npm run dev
npm run debug
npm run build
npm run start
npm run lint
```

Open [http://localhost:3001](http://localhost:3001) after starting the development server. The separate course API uses port 3000.

## Docker (Windows / Docker Desktop)

1. Запустите Docker Desktop и дождитесь готовности Linux engine.
2. Запустите существующий Top API на компьютере, порт `3000`. Он нужен и во время сборки, и при работе сайта: `generateStaticParams` получает список страниц из API.
3. В терминале из папки проекта соберите образ:

```bash
docker build -t owltop .
```

4. Запустите контейнер:

```bash
docker run --rm -p 127.0.0.1:3002:3000 owltop
```

Откройте [http://localhost:3002](http://localhost:3002). Порт `3002` — на вашем компьютере, `3000` — внутри контейнера. Остановить сайт можно через `Ctrl+C`; `--rm` затем удалит только этот контейнер. Образ и база отдельного API сохранятся.

`Dockerfile` использует Node.js 22, устанавливает зависимости через `npm ci`, собирает Next.js, удаляет зависимости разработки и запускает приложение от пользователя `node`. `.dockerignore` исключает локальные зависимости, сборки и `.env` из образа. Локальные `.env` на компьютере не меняются.

В Docker адрес API по умолчанию — `http://host.docker.internal:3000`: это доступ из контейнера к компьютеру через Docker Desktop. Для другого доступного адреса передайте его при сборке:

```bash
docker build --build-arg NEXT_PUBLIC_DOMAIN=https://api.example.com -t owltop .
```

`NEXT_PUBLIC_DOMAIN` фиксируется при `next build`: изменение адреса требует новой сборки образа, одного `docker run -e ...` недостаточно. Этот образ содержит сайт; отдельный Top API и его SQLite-база в него не входят.

## Pages

- `/` — Photoshop courses, jobs and benefits.
- `/courses` and `/courses/[category]` — course catalog and directions.
- `/services`, `/books`, `/products` — additional collections.
- `/catalog/[slug]` — details, program and reviews.
- `/search?q=...` — search across API catalog data.
- `/about`, `/terms`, `/privacy` — project information.

All catalog pages read the local Top API at `NEXT_PUBLIC_DOMAIN` (port 3000) through `api/catalog.ts`. Sorting uses the fetched items; search, navigation and details use the same server snapshot. Reviews are saved through `/api/catalog/reviews` to the API database and survive refresh.

The preserved 21-item collection in `data/catalog.ts` is an import source, not a runtime fallback. With the API running, `npm run api:seed` imports missing products, reviews and categories without deleting existing records or duplicating them on repeated runs. Presentation metadata preserves original URLs, icons, colors and programs. The API's original three courses stay available too.

Import uses the local API's documented default account. If changed, set `API_LOGIN` and `API_PASSWORD`; `API_URL` can override the import target. Credentials are used only by the import script, never sent to the browser.

The review form in `components/course/ReviewForm.tsx` uses React Hook Form: `register` connects inputs, `handleSubmit` validates values, `formState.errors` displays field errors, and `reset` clears text and rating after submission. Input and Textarea accept refs through React 19 props.
