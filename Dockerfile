FROM node:24-bookworm

WORKDIR /workspace

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

CMD ["sh", "-c", "npm run sandbox:check && npm test && npm run build"]
