Cron Control Go Runner
======================

In addition to the REST API endpoints that can be used to run events, a Go-based runner is provided.

# Installation

1. Build the binary as described below.
2. Copy `init.sh` to `/etc/init.d/cron-control-runner`
3. To override default configuration, copy `defaults` to `/etc/default/cron-control-runner` and modify as needed
4. Run `update-rc.d cron-control-runner defaults`
5. Start the runner: `/etc/init.d/cron-control-runner start`
6. Check the runner's status: `/etc/init.d/cron-control-runner status`

# Runner options

* `-cli` string
  * Path to WP-CLI binary (default `/usr/local/bin/wp`)
* `-heartbeat` int
  * Heartbeat interval in seconds (default `60`)
* `-log` string
  * Log path, omit to log to Stdout (default `os.Stdout`)
* `-network` int
  * WordPress network ID, `0` to disable (default `0`)
* `-workers-get` int
  * Number of workers to retrieve events (default `1`)
  * Increase for multisite instances so that sites are retrieved in a timely manner
* `-workers-run` int
  * Number of workers to run events (default `5`)
  * Increase for cron-heavy sites and multisite instances so that events are run in a timely manner
* `-wp` string
  * Path to WordPress installation (default `/var/www/html`)

# Build the binary

If building on the target system, or under the same OS as the target machine, simply:

```
make
```

If building from a different OS:

```
env GOOS=linux make
```

Substitute `linux` with your target OS.
