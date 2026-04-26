# Build Stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Production Stage
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
# We use a custom nginx config for the gateway, so this default nginx
# just serves the static files on port 80.
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
