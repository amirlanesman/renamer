#!/bin/bash
source  ~/.zshrc
source  ~/.bash_profile
cd /Users/amirlanesman/Documents/renamer
i=`date +%F_%T`;
echo "$PATH" >> "user/logs/test-$i.log"
node -v >> "user/logs/test-$i.log"