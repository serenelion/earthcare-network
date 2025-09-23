# Build stage for React app
FROM node:18-alpine AS build

WORKDIR /app

# Copy package files
COPY package.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY src/ ./src/
COPY public/ ./public/
COPY tsconfig.json* ./

# Set build environment variables
ENV REACT_APP_CRM_API_URL=https://crm.app.earthcare.network/graphql
ENV REACT_APP_CRM_BASE_URL=https://crm.app.earthcare.network

# Build the React app
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built React app
COPY --from=build /app/build /usr/share/nginx/html

# Copy static HTML files for backward compatibility
COPY about.html /usr/share/nginx/html/about.html
COPY sponsors.html /usr/share/nginx/html/sponsors.html

# Create custom nginx configuration
RUN echo 'server { \
    listen 80; \
    server_name _; \
    root /usr/share/nginx/html; \
    index index.html; \
    \
    # Enable gzip compression \
    gzip on; \
    gzip_vary on; \
    gzip_min_length 1024; \
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json; \
    \
    # Security headers \
    add_header X-Frame-Options "SAMEORIGIN" always; \
    add_header X-XSS-Protection "1; mode=block" always; \
    add_header X-Content-Type-Options "nosniff" always; \
    add_header Referrer-Policy "no-referrer-when-downgrade" always; \
    add_header Content-Security-Policy "default-src \047self\047 https: data: \047unsafe-inline\047 \047unsafe-eval\047;" always; \
    \
    # Cache static assets \
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ { \
        expires 1y; \
        add_header Cache-Control "public, immutable"; \
    } \
    \
    # Handle SPA routing \
    location / { \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

# Remove default nginx index
RUN rm -f /usr/share/nginx/html/index.html.default

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost/ || exit 1

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]