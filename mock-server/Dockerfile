FROM golang:1.23-alpine AS builder

WORKDIR /app

RUN apk add --no-cache git curl bash

COPY go.mod go.sum ./
RUN go mod download

COPY . .

RUN go build -o /server ./.

FROM gcr.io/distroless/base-debian10 AS runtime

COPY --from=builder /server /server

EXPOSE 9099

ENTRYPOINT ["/server"]
