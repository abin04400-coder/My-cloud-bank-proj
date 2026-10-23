# stage 1: builder
FROM alpine:3.22 AS builder

WORKDIR /app

COPY public/ ./public/
COPY nginx/default.conf.template ./nginx/default.conf.template

# stage 2 : production
FROM nginx:alpine AS production

COPY --from=builder /app/public/ /usr/share/nginx/html/
COPY --from=builder /app/nginx/default.cont.template /etc/nginx/template/default.conf.template

EXPOSE 80
CMD ["nginx", "-g" ,"daemon off;"]