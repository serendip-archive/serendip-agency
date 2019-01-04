FROM node:alpine

RUN mkdir /website
WORKDIR /website

LABEL traefik.backend=serendip-agency
LABEL traefik.docker.network=bridge
LABEL traefik.enable=true  
LABEL traefik.frontend.entryPoints=http,https
LABEL traefik.frontend.rule=Host:demo.serendip.agency
LABEL traefik.port=2080 

RUN npm i -g serendip-web

COPY . /website/

RUN serendip-web --dir=/website