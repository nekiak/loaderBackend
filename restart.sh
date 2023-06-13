#!/bin/bash

# Change to your project directory
cd ~~/loaderBackend

# Perform Git pull
git pull

# Restart Node.js app using PM2
pm2 restart all

