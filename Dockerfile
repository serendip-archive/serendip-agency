FROM node:alpine
WORKDIR /app
COPY . .
RUN npm install serendip-web
EXPOSE 2080
USER node
CMD [ "node", "node_modules/serendip-web/bin/server.js", " -p 2080" ]