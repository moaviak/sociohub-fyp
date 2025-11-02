# Frontend Dockerfile (web/Dockerfile)
FROM node:18-alpine AS builder

WORKDIR /app

# Accept build arguments for environment variables
ARG VITE_REACT_APP_API_URL
ARG VITE_REACT_APP_SERVER_URL
ARG VITE_REACT_APP_STRIPE_PUBLISHABLE_KEY

# Set them as environment variables for the build process
ENV VITE_REACT_APP_API_URL=$VITE_REACT_APP_API_URL
ENV VITE_REACT_APP_SERVER_URL=$VITE_REACT_APP_SERVER_URL
ENV VITE_REACT_APP_STRIPE_PUBLISHABLE_KEY=$VITE_REACT_APP_STRIPE_PUBLISHABLE_KEY

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the app
RUN npm run build

# Production stage with Nginx
FROM nginx:alpine

# Copy built files to nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]