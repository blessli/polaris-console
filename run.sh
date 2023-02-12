#!/bin/sh
function check_mysql() {
    port=`netstat -nlt|grep 3306|wc -l`
    if [ $port -ne 1 ]; then
        echo "mysql is closed"
    else
        echo "mysql is running"
        return 1
    fi
    return 0
}
if check_mysql 0; then
    echo "mysql closed"
    exit 1
fi
echo "mysql running"
mainpid=$(lsof -i:8082|grep 'LISTEN'|awk '{print $2}')
echo $mainpid
if [ $mainpid > 0 ];then
    echo "main process id:$mainpid"
    kill -9 $mainpid
    if [ $? -eq 0 ];then
    echo "kill $mainpid success"
    go run main.go
    else
    echo "kill $mainpid fail"
    fi
else
    go run main.go
fi