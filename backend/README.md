auto_calib_back

* install
  - yarn install

* local
  - yarn start

* pm2
  - pm2 start auto_calib_back.config.js

* Docker
  - docker build -t auto_calib_back/auto_calib_back .
  - docker run -d --name auto_calib_back -p 4000:4000 auto_calib_back/auto_calib_back

