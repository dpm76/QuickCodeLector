# Stage 1: Build production bundle
FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

# Copy all source files
COPY . .
RUN npm run build

# Stage 2: Serve using Nginx
FROM nginx:alpine

# Copy Nginx SPA config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy production built artifacts from stage 1
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
