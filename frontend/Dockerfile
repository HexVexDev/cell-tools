# --------- Build Stage ---------
FROM node:18 AS build

WORKDIR /app

# Copy only package files first (for caching)
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci

# Copy all source files
COPY . .

# Build the React app (output in /app/build)
RUN npm run build

# --------- Production Stage ---------
FROM nginx:alpine

# Copy the build output from the previous stage
COPY --from=build /app/build /usr/share/nginx/html

# Expose port 80 for HTTP traffic
EXPOSE 3000

# Run nginx in the foreground
CMD ["nginx", "-g", "daemon off;"]
