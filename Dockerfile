FROM node:20-bookworm-slim AS build

WORKDIR /app

COPY package*.json ./
RUN npm install --production=false

COPY . .

FROM gcr.io/distroless/nodejs20-debian12

WORKDIR /app

COPY --from=build /app .

EXPOSE 8080

CMD ["src/index.js"]
