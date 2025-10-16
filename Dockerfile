FROM node:23-slim
RUN corepack enable
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile --prod
COPY . .
RUN chmod +x /app/bin/start.js
CMD ["/app/bin/start.js"]
