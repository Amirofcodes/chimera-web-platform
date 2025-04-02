FROM node:18-alpine

WORKDIR /app

# Install curl for healthcheck
RUN apk add --no-cache curl

# Install dependencies
COPY package*.json ./
RUN npm install

# Install Tailwind CSS and dependencies
RUN npm install -D tailwindcss postcss autoprefixer

# Install Stripe JS SDK
RUN npm install @stripe/stripe-js

# Copy app source
COPY . .

# Build CSS
RUN npm run build:css

# Environment variables (for development, these can be overridden by your .env file)
ENV NODE_ENV=development
ENV WATCHPACK_POLLING=true
ENV WDS_SOCKET_PORT=0

# Expose port
EXPOSE 3000

# Start development server
CMD ["npm", "start", "--", "--host", "0.0.0.0"]
