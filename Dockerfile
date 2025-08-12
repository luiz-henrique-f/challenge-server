FROM node:20-slim

RUN apt-get update -y && apt-get install -y openssl procps curl

WORKDIR /home/node/app

COPY package*.json ./
RUN npm install -g npm@11.5.2 && npm install

COPY . .

CMD ["npm", "run", "start:prod"]
