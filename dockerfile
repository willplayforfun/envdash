# Start with a pre-built image that has Node.js installed
FROM node:22-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package.json files first (for dependency caching)
COPY package*.json ./

# Install npm dependencies
RUN npm install

# Copy the rest of your source code
COPY . .

# Tell Docker this app uses port 3000
EXPOSE 3000

# The command to run when the container starts
CMD ["npm", "start"]