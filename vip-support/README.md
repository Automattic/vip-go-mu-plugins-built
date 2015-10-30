# WordPress.com VIP Support

[![Build Status](https://magnum.travis-ci.com/Automattic/vipv2-support.svg?token=saKYXPvcnyNUH8ChL4di&branch=master)](https://magnum.travis-ci.com/Automattic/vipv2-support)

Manages the WordPress.com Support Users on your site.

## Changelog

### 2.0.1

* Remove stray error_log call

### 2.0

* Allow users with Automattic email addresses to not be a support user
* Add a CLI command to force verify a user's email address
* Provide `is_valid_automattician` static method on `WPCOM_VIP_Support_User`
* Auto-verify an Automattician email address when they reset their password successfully via email

## Changelog

### 1.0

* Initial release