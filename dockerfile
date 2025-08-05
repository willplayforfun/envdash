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

# No ports exposed - those are specified by the docker-compose.yml 
# No command - it is specified by the docker-compose.yml