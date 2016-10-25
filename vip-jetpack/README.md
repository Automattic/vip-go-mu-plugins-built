# vipv2-jetpack

Jetpack changes for VIP Go


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
