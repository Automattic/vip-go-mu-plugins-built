Feature: The Jetpack plugin is active and MU
  As a site owner
  I must have the Jetpack plugin activated

  @javascript @insulated
  Scenario: The plugin is shown as active in Must Use plugins
    Given I am logged in as "admin" with the password "password" and I am on "/wp-admin/plugins.php?plugin_status=mustuse"
    Then I should see "MU Jetpack by WordPress.com"
