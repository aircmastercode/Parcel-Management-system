FROM node:16-alpine

WORKDIR /app

# Install dependencies required for building SQLite
RUN apk add --no-cache --virtual .build-deps \
    python3 \
    make \
    g++ \
    sqlite-dev

COPY package*.json ./

# Install node modules
RUN npm install

# Clean up build dependencies to reduce image size
RUN apk del .build-deps

# Create a directory for database storage
RUN mkdir -p db-data

# Copy the rest of the application
COPY . .

# Make the init script executable
RUN chmod +x docker-init.sh

EXPOSE 8000

CMD ["./docker-init.sh"] 