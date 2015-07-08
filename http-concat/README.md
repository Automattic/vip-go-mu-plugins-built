nginx-http-concat
=================

Overview
--------

WP.com plugin to perform CSS and Javascript concatenation of individual scripts into a single script.

Installation & Configuration
----------------------------

1) Copy the ‘http-concat’ directory and its contents to your WordPress plugins directory.

2) Configure the NGINX server to perform the concatenation step in the process by adding the following to your WordPress installations NGINX configuration:

	location /_static/ {
            fastcgi_pass unix:/var/run/fastcgi.sock;
            include /etc/nginx/fastcgi_params;
            fastcgi_param SCRIPT_FILENAME $document_root/wp-content/plugins/http-concat/ngx-http-concat.php;
    }

3) Once this is done the installation is ready for use and you can enable/disable the JS and/or CSS concatenation via the plugins interface of your WordPress installation.
