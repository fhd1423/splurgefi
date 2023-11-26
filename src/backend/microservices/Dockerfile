#Base image for node runtime environment
FROM node:alpine 

ENV PYTHON=/Library/Frameworks/Python.framework/Versions/3.11/bin/python3

WORKDIR /app

#Copy/Move package.json dependencies to working directory /app
COPY package.json .

# Install dependencies including TypeScript and build tools
RUN apk --no-cache add \
    python3 \
    make \
    g++ \
  && npm install \
  && npm install -g typescript \
  && npm install -g concurrently

# Copy the whole project
COPY . .

# Compile TypeScript to JavaScript
RUN tsc

# Start the application
CMD ["concurrently", "npm:evalute", "npm:prices"]
