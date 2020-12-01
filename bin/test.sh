#!/bin/zsh
source  ~/.zshrc

cd /Users/amirlanesman/Documents/renamer
i=`date +%F_%T`;
echo "$PATH" 2>&1 | tee -a "user/logs/test-$i.log"
node -v 2>&1 | tee -a "user/logs/test-$i.log"