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
2. Запустите существующий Top API на компьютере, порт `3000`. Он нужен при работе сайта; сборка не обращается к базе или API.
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

All catalog pages use `api/catalog.ts`. Locally (`API_BACKEND=external`) it reads the separate Top API at `NEXT_PUBLIC_DOMAIN` (port 3000). In cloud mode (`API_BACKEND=neon`) it queries Postgres on the server. Sorting, search, navigation and details use the same request snapshot. Reviews are saved through `/api/catalog/reviews` to the selected database and survive refresh.

The preserved 21-item collection in `data/catalog.ts` is an import source, not a runtime fallback. With the API running, `npm run api:seed` imports missing products, reviews and categories without deleting existing records or duplicating them on repeated runs. Presentation metadata preserves original URLs, icons, colors and programs. The API's original three courses stay available too.

Import uses the local API's documented default account. If changed, set `API_LOGIN` and `API_PASSWORD`; `API_URL` can override the import target. Credentials are used only by the import script, never sent to the browser.

The review form in `components/course/ReviewForm.tsx` uses React Hook Form: `register` connects inputs, `handleSubmit` validates values, `formState.errors` displays field errors, and `reset` clears text and rating after submission. Input and Textarea accept refs through React 19 props.

## Vercel + Neon

Для личного некоммерческого портфолио используйте Vercel Hobby и Neon Free в пределах лимитов этих тарифов. Не включайте Pro trial или платный тариф базы. Развёртывание и миграция не запускаются автоматически при сборке.

1. Создайте или выберите бесплатную базу Neon. Подключите её к проекту Vercel через Storage/Marketplace либо добавьте её `DATABASE_URL` в серверные Environment Variables проекта.
2. В Vercel задайте `API_BACKEND=neon`. `DATABASE_URL` — секрет, **не** `NEXT_PUBLIC_DATABASE_URL`. Локальный `.env` можно оставить в режиме `external`. Не публикуйте строки подключения в Git или логи.
3. Для переноса используйте Node.js 24+ и прямой `DATABASE_URL_UNPOOLED` в игнорируемом `.env.local`. Если используете `DATABASE_URL` для миграции, он тоже должен быть прямым (без `-pooler`). Сначала проверьте источник без облачных записей:

```powershell
npm run cloud:import -- --sqlite "C:/absolute/path/data.db"
```

Затем, проверив целевую базу, выполните перенос:

```powershell
npm run cloud:import -- --sqlite "C:/absolute/path/data.db" --apply
```

Скрипт читает согласованный снимок SQLite вместе с WAL. Не копируйте один `data.db` из работающего API: актуальные данные могут оставаться в WAL. Переносятся товары, страницы и отзывы; учётные записи и пароли не читаются. ID, адреса, программы и метаданные сохраняются. Схема `database/schema.sql` создаёт только таблицы `owltop_*`; импорт использует транзакцию и `ON CONFLICT DO NOTHING`, не перезаписывая существующие облачные записи. Локальная база не меняется.

4. Проверьте проект и импорт перед production deployment:

```bash
npm run lint
npx tsc --noEmit
npm run test:cloud
npm run build
npm audit --omit=dev
```

Тесты используют настоящий движок Postgres через PGlite, без облачной базы и секретов. Они проверяют контракт API, сохранение/агрегацию отзывов, повторный импорт, параллельные запросы и лимит отправок.

В облачном режиме доступны публичные методы `/api/product/find`, `/api/top-page/find`, `/api/top-page/byAlias/[alias]`, `/api/review/byProduct/[id]` и `/api/review/create`. Администрирование, авторизация и загрузки старого API намеренно не выставлены наружу. Отзывы проходят серверную валидацию; облачная база ограничивает отправку до пяти отзывов на клиента за десятиминутное окно. IP не хранится, сохраняется только HMAC-ключ. Это базовый барьер против спама, не полноценная модерация.

После подключения Git-репозитория Vercel может собирать изменения автоматически. Проверки GitHub Actions дополняют сборку; сами по себе они не блокируют автоматический production deploy без отдельной настройки release checks.
