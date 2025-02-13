# Stage 1: Build Vue.js application
FROM node:14-alpine AS build-stage

WORKDIR /app

# Copy package.json first to leverage Docker cache for dependencies
COPY package*.json ./

# Install dependencies
RUN npm install
# RUN npm run build-prod

# Copy remaining files and build the application
COPY . .

# Debugging: List files in /usr/src/app
RUN ls -l /app

# Stage 2: Serve the application using a lightweight image
FROM nginx:alpine

# Copy built artifacts from the previous stage
COPY --from=build-stage /app/dist /usr/share/nginx/html

# Expose port 80
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
