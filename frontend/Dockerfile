# Multi-stage production build configuration
FROM node:20-alpine AS builder

WORKDIR /app

# Install project dependencies
COPY package*.json ./
RUN npm ci

# Pull source and build production asset bundle
COPY . .
ENV VITE_API_URL=/api
RUN npm run build


FROM nginx:1.25-alpine AS runner

# Copy compiled static output to standard Nginx deployment pathway
COPY --from=builder /app/dist /usr/share/nginx/html

# Clean default server configuration file
RUN rm /etc/nginx/conf.d/default.conf

# Inject lightweight reverse-proxy routing profile
COPY <<-'EOF' /etc/nginx/conf.d/default.conf
server {
    listen 80;
    server_name localhost;

    location / {
        root /usr/share/nginx/html;
        index index.html index.htm;
        try_files $uri $uri/ /index.html;
    }

    # Proxy workspace requests cleanly to the backend container API
    location /api/ {
        proxy_pass http://backend:8000/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]