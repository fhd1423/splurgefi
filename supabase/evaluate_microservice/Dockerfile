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
  && npm install -g typescript

# Copy the whole project
COPY . .

# Compile TypeScript to JavaScript
RUN tsc

# Start the application
CMD ["node", "index.js"] # Adjust the path according to your outDir in tsconfig.json
