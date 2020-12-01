#!/bin/zsh
source  ~/.zshrc

cd /Users/amirlanesman/Documents/renamer

i=`date +%F_%T`;
echo "executing renamer. param[0]: $1" 2>&1 | tee -a "user/logs/rename-$i.log"
echo "node -v:" 2>&1 | tee -a "user/logs/rename-$i.log"
node -v 2>&1 | tee -a "user/logs/rename-$i.log"
node rename.js --path "$1" 2>&1 | tee -a "user/logs/rename-$i.log" 2>&1