FROM node:20-slim

RUN apt-get update -y && apt-get install -y openssl procps

RUN npm install -g npm@11.5.2

WORKDIR /home/node/app

USER node

CMD ["npm", "run", "start:dev"]
