#!/bin/sh

if [ "$(wp theme list --format=count)" = "0" ]; then
    wp theme install --activate twentytwentyfive
fi
