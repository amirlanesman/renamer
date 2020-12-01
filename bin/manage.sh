#!/bin/zsh
source  ~/.zshrc

cd /Users/amirlanesman/Documents/renamer

i=`date +%F_%T`;
echo "executing renamer. param[0]: $1" 2>&1 | tee -a "user/logs/manage-$i.log"
echo "node -v:" 2>&1 | tee -a "user/logs/manage-$i.log"
node -v 2>&1 | tee -a "user/logs/manage-$i.log"
MEDIA_MANAGER_ARGS="-scrapeAll" node manage.js --path "$1" 2>&1 | tee -a "user/logs/manage-$i.log" 2>&1