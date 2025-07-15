# Use official Node.js base image
FROM node:18-alpine

# Set working directory inside container
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies with legacy-peer-deps
RUN npm install --legacy-peer-deps

# Copy the rest of the project files (including src/)
COPY . .

# Build your app (adjust as per your project, e.g., for Next.js, Vite, etc.)
RUN npm run build

# Expose port - adjust based on your app
EXPOSE 3000

# Start the app (adjust command if you're using next.js or a custom server)
CMD ["npm", "start"]
