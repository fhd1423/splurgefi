FROM node:alpine

WORKDIR /app

# Install Python and other build dependencies
RUN apk add --update python3 make g++ 

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Install dependencies
RUN npm install && npm install -g concurrently && npm install -g nodemon


# Copy the rest of your application
COPY . .

# Set the entrypoint to use concurrently
ENTRYPOINT ["concurrently", "\"npm:docker-*\""]
