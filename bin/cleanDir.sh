#!/bin/zsh
source  ~/.zshrc

cd /Users/amirlanesman/Documents/renamer

i=`date +%F_%T`;
echo "executing renamer. param[0]: $1" >> "user/logs/rename-$i.log"
echo "node -v:" >> "user/logs/rename-$i.log"
node -v >> "user/logs/rename-$i.log"
node rename.js --discardFiles --path "$1" >> "user/logs/rename-$i.log" 2>&1