#!/bin/bash
source  ~/.zshrc
source  ~/.bash_profile

cd /Users/amirlanesman/Documents/renamer

i=`date +%F_%T`;
echo "executing renamer. param[0]: $1" >> "user/logs/rename-$i.log"
echo "node -v:" >> "user/logs/rename-$i.log"
/Users/amirlanesman/.nvm/versions/node/v10.12.0/bin/node -v >> "user/logs/rename-$i.log"
/Users/amirlanesman/.nvm/versions/node/v10.12.0/bin/node rename.js --path "$1" >> "user/logs/rename-$i.log" 2>&1