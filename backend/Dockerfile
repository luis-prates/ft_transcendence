# Base image
FROM node

#M Make directory to hold the application code inside the image
RUN mkdir -p /usr/src/app
RUN mkdir -p /usr/src/app/backend

# Set the working directory so that all following commands run in this directory
WORKDIR /usr/src/app/backend

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose the port the app runs in
EXPOSE 3370

RUN chmod +x ./docker-entrypoint.sh

ENTRYPOINT [ "./docker-entrypoint.sh" ]

# Command to run the app
CMD [ "npm", "start" ]
