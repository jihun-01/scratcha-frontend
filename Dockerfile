FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

ARG VITE_API_URL=http://210.109.80.247:8001
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

FROM nginx:alpine

# nginx.conf 복사
COPY nginx.conf /etc/nginx/nginx.conf

COPY --from=0 /app/dist /usr/share/nginx/html

# docker-entrypoint.sh 복사
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

EXPOSE 80

CMD ["/docker-entrypoint.sh"]