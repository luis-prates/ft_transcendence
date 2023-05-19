# Base image
FROM node:alpine

# Make folder to hold the application code inside the image
RUN mkdir -p /usr/src/app
RUN mkdir -p /usr/src/app/frontend

RUN npm install -g http-server

# Set the working directory so that all following commands run in this directory
WORKDIR /usr/src/app/frontend

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the application code
COPY . .

RUN npm run build

# Expose the port the app runs in
EXPOSE 8080

# Command to run the app
CMD [ "http-server", "dist" ]