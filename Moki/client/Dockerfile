ARG img=node:10
ARG img_nginx=nginx:alpine
FROM ${img} as dev

WORKDIR /app

# install app dependencies
COPY package*.json ./
RUN npm install --silent

ENV PATH=$PATH:/app/node_modules/.bin

# Copy source
COPY . ./

CMD npm start

FROM ${img} as build

ENV NODE_ENV=production

WORKDIR /app
COPY ./package*.json ./
RUN npm install --production --silent
COPY . .

RUN npm run build -o app

# multistage build...
# this runs a lil nginx instance to serve the app
FROM ${img_nginx} as prod

EXPOSE 3000
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
