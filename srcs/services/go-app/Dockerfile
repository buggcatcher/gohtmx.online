FROM golang:1.25-alpine AS builder

WORKDIR /src

COPY go.mod go.sum ./
RUN go mod download

COPY . .
RUN CGO_ENABLED=0 go build -o /out/go-app .

FROM alpine:3.20

WORKDIR /app

COPY --from=builder /out/go-app /app/go-app
COPY static /app/static
COPY templates /app/templates

EXPOSE 8080

CMD ["/app/go-app"]