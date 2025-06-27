FROM node:18 as build

WORKDIR /app

# Copy only package files first
COPY package.json package-lock.json ./

# Install dependencies inside Docker (not copying local node_modules!)
RUN npm ci  

# Now copy source code
COPY . .

# Build the React app
RUN npm run build