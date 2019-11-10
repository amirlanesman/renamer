#!/bin/bash
source  ~/.zshrc
source  ~/.bash_profile

cd /Users/amirlanesman/Documents/renamer

i=`date +%F_%T`;
echo "executing renamer. param[0]: $1" >> "user/logs/manage-$i.log"
echo "node -v:" >> "user/logs/manage-$i.log"
/Users/amirlanesman/.nvm/versions/node/v10.12.0/bin/node -v >> "user/logs/manage-$i.log"
MEDIA_MANAGER_ARGS="-scrapeAll" /Users/amirlanesman/.nvm/versions/node/v10.12.0/bin/node manage.js --path "$1" >> "user/logs/manage-$i.log" 2>&1