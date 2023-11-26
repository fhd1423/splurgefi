#Base image for node runtime environment
FROM node:alpine 

ENV PYTHON=/Library/Frameworks/Python.framework/Versions/3.11/bin/python3

WORKDIR /app

#Copy/Move package.json dependencies to working directory /app
COPY package.json .

#APK is alpinePackageManager for dependencies. Adding python3,make,g++ build tools before building packages
RUN apk --no-cache add \
  python3 \
  make \
  g++ \
  && npm install

#Copy env variables
COPY .env .env

#Copy/Move script into working directory
COPY index.ts .

CMD ["npx","ts-node","index.ts"]
