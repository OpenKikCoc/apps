FROM node:20-slim

WORKDIR /app

# Install dependencies
COPY package.json ./
RUN npm install

# Copy source code
COPY . .

# Expose Wrangler port
EXPOSE 8788

# Disable Wrangler analytics and update checks
ENV WRANGLER_SEND_METRICS=false
ENV WRANGLER_CHECK_UPDATES=false

# Bind to all interfaces for Docker access
# --ip 0.0.0.0 allows access from host
# --port 8788 ensures the port is fixed
CMD ["npx", "wrangler", "pages", "dev", "public", "--d1", "DB=apps-db", "--ip", "0.0.0.0", "--port", "8788", "--no-show-interactive-dev-session"]
