<?php
/**
 * Invalid config: not a PHP array. Exercises the is_array() guard in Config —
 * the plugin treats this the same as no config at all.
 */

return 'this-is-not-an-array';
