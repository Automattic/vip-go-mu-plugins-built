Feature: Some modules are mandatory
  As a site owner
  In order for my site to run on VIPv2
  Some modules must always be active and I must not be able to activate them

  @javascript @insulated
  Scenario: As an example, the Stats module should show as mandatory and Omnisearch should NOT show as mandatory
    Given I am logged in as "admin" with the password "password" and I am on "/wp-admin/admin.php?page=jetpack_modules"
    # Check Omnisearch module is not mandatory
    Then I should not see a "#wpcom-vip-no-delete-omnisearch" element
    And I should see an "input[value='omnisearch'][type='checkbox']" element
    # Check Stats module is mandatory
    And I should see "This module is required for WordPress.com VIP" in the "#wpcom-vip-no-delete-stats" element
    And I should not see an "input[value='stats'][type='checkbox']" element
