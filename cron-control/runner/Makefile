# MakeFile for cron-control-runner

DIR=`pwd`
GO=/usr/local/go/bin/go
EXECUTABLE=cron-control-runner

all:
	GOPATH=${DIR}/../ ${GO} build -o ${DIR}/../bin/${EXECUTABLE}

clean:
	@ rm -f  ${DIR}/../bin/${EXECUTABLE}
