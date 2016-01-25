#!/bin/bash
#Used by Livefyre to push changes to test boxes

while getopts s:p:u: option
do
    case "${option}"
    in
        s) SERVER="${OPTARG}";;
        p) DESTPATH="${OPTARG}";;
		u) USERNAME="${OPTARG}";;
        
        \?) exit;;
    esac
done

if [[ -z $SERVER || -z $DESTPATH || -z $USERNAME ]]; then
	echo "You need tp specify a server, username and destination path to install into!"
	echo "Format: $0 -sSERVER -p/path/to/where/to/put/plugin -uSERVERUSERNAME"
	exit 1
fi

PLUGINNAME=livefyre-apps.zip
make
scp $PLUGINNAME $USERNAME@$SERVER:$DESTPATH
sleep 1
ssh $USERNAME@$SERVER "cd $DESTPATH; unzip -o $PLUGINNAME; rm $PLUGINNAME"
