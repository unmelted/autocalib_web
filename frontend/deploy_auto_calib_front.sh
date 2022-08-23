#!/bin/bash

sudo yarn build
sudo cp -rf ./build/* /var/www/html/
