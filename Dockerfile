# syntax=docker/dockerfile:1.7

# ===== Build stage =====
FROM node:22-alpine AS build
WORKDIR /app
RUN corepack enable

# Cache deps first (lockfile-driven)
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

# Copy sources and build
COPY . .
# VITE_* vars are baked into the bundle at build time.
ARG VITE_API_BASE_URL=http://localhost:8080
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}
RUN pnpm build

# ===== Runtime stage (pure static nginx; no reverse proxy) =====
FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
