FROM nginx:1.27-alpine

RUN apk add --no-cache openssl

# ARG dinamici per il certificato SSL
ARG DOMAIN_NAME=jack.42.fr
ARG USERNAME=jack

COPY conf/nginx.conf /etc/nginx/conf.d/default.conf

RUN mkdir -p /etc/nginx/ssl && \
    openssl req -x509 -nodes \
      -out /etc/nginx/ssl/gohtmx.crt \
      -keyout /etc/nginx/ssl/gohtmx.key \
      -subj "/C=IT/ST=Florence/L=Florence/O=42/OU=42/CN=${DOMAIN_NAME}/UID=${USERNAME}" \
      -days 365

EXPOSE 443