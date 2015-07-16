# vipv2-jetpack [![Build Status](https://magnum.travis-ci.com/Automattic/vipv2-jetpack.svg?token=saKYXPvcnyNUH8ChL4di&branch=add/first-version)](https://magnum.travis-ci.com/Automattic/vipv2-jetpack)

Jetpack changes for VIPv2


## Install Unit Tests

```bash
cd path/to/vip-jetpack
# Replace $DB_USER and $DB_PASS with a MySQL user and password which can 
# create the test DB
./bin/install-wp-tests.sh wordpress_test $DB_USER $DB_PASS localhost 4.2.2
```

## Run the Unit Tests

```bash
cd path/to/vip-jetpack
phpunit
```
