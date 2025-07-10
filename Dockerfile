FROM node:18-alpine

# # Install git
# RUN apk update && apk upgrade && apk add --no-cache bash git openssh

# Update package and install git (Needed for pm-connector)
RUN apk update && apk add git

# create the directory inside the container
WORKDIR /usr/src/app

# copy essential files to install dependencies
# copy both 'package.json' and 'package-lock.json' (if available)
COPY ["package.json", "./"]

# install project dependencies
RUN npm install

# copy project files and folders to the current working directory (i.e. 'app' folder)
COPY . .

# build app for production with minification
RUN npm run build

# Command to start build 
 CMD ["npm", "start"]
 EXPOSE 9015