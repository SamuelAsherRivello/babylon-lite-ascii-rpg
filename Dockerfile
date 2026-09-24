FROM node:24-bookworm

WORKDIR /workspace

# Docker Desktop's Codex CLI launcher invokes this exact path. Keep it an
# explicit container dependency instead of relying on the base image layout.
RUN apt-get update \
    && apt-get install --no-install-recommends --yes bash \
    && test -x /usr/bin/bash \
    && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

CMD ["sh", "-c", "npm run sandbox:check && npm test && npm run build"]
