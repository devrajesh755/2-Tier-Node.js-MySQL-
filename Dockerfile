# Base Image (OS)
FROM node:20-slim

# Working Directory
WORKDIR /app

# Copy files
COPY . .

# Install dependencies and build
RUN npm install --only=production

# Expose port
EXPOSE 3000

# Start the app
CMD ["npm", "start"]
