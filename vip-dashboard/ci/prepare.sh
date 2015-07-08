#!/bin/bash

# called by Travis CI

# Exit if anything fails AND echo each command before executing
# http://www.peterbe.com/plog/set-ex
set -ex

# Install NPM
# ==================

npm install
