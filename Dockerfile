FROM node:12.14.1-alpine
WORKDIR /app
COPY package.json /app
RUN apk update && apk upgrade && apk add php7 php7-fpm php7-opcache
RUN npm install
COPY . /app
#CMD npm run dev