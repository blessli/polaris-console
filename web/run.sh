#!/bin/sh
mainpid=$(lsof -i:8877|grep 'LISTEN'|awk '{print $2}')
echo $mainpid
if [ $mainpid > 0 ];then
    echo "main process id:$mainpid"
    kill -9 $mainpid
    if [ $? -eq 0 ];then
    echo "kill $mainpid success"
    npm run dev
    else
    echo "kill $mainpid fail"
    fi
else
    npm run dev
fi