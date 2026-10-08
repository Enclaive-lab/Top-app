FROM node:22-alpine

# Рабочая папка внутри образа.
WORKDIR /app

# Git-хуки внутри Docker не нужны. Сборка не отправляет телеметрию Next.js.
ENV HUSKY=0 NEXT_TELEMETRY_DISABLED=1

# Устанавливаем точные версии библиотек до копирования исходников.
COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# API запущен отдельно на Windows. Адрес можно заменить через --build-arg.
# NEXT_PUBLIC_* фиксируются при сборке Next.js.
ARG NEXT_PUBLIC_DOMAIN=http://host.docker.internal:3000
ENV NEXT_PUBLIC_DOMAIN=${NEXT_PUBLIC_DOMAIN}
ENV NODE_ENV=production PORT=3000

# API должен быть доступен: generateStaticParams запрашивает его при сборке.
RUN npm run build && npm prune --omit=dev

# Next.js может записывать кэш; приложению не нужны права root.
RUN chown -R node:node /app/.next
USER node

EXPOSE 3000
CMD ["npm", "start", "--", "--hostname", "0.0.0.0"]
