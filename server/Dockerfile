FROM golang:1.26-alpine AS build
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 go build -o navi-core ./cmd/navi-core

FROM alpine:3.20
COPY --from=build /app/navi-core /usr/local/bin/
EXPOSE 8080
ENTRYPOINT ["navi-core"]
CMD ["--config", "/etc/navi/config.yaml"]
