# Build stage
FROM node:20-alpine AS build
WORKDIR /app

ARG VITE_API_BASE_URL=/api
ARG VITE_CORE_API_BASE_URL=/api
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}
ENV VITE_CORE_API_BASE_URL=${VITE_CORE_API_BASE_URL}

RUN corepack enable
COPY package.json pnpm-lock.yaml ./
COPY . .
RUN pnpm install --frozen-lockfile
RUN pnpm run build

# Production runtime
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
