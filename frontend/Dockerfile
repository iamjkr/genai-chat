# Multi-stage build for React frontend
FROM node:18-alpine as builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built application from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S react -u 1001

# Set proper permissions
RUN chown -R react:nodejs /usr/share/nginx/html
RUN chown -R react:nodejs /var/cache/nginx
RUN chown -R react:nodejs /var/log/nginx
RUN chown -R react:nodejs /etc/nginx/conf.d
RUN touch /var/run/nginx.pid
RUN chown -R react:nodejs /var/run/nginx.pid

USER react

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:80/ || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]