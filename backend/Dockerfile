FROM node:14.19.3

RUN mkdir -p /home/app/auto_calib_back
RUN mkdir -p /home/app/auto_calib_back/logs

WORKDIR /home/app/auto_calib_back

# log dir
VOLUME /home/app/auto_calib_back/logs

# Bundle app source
COPY . /home/app/auto_calib_back
# Install app dependencies
RUN npm install -g pm2
RUN npm install
RUN ["apt-get", "update"]
RUN ["apt-get", "install", "-y", "vim"]

EXPOSE 4000

CMD ["pm2-runtime", "start", "auto_calib_back.config.js"]