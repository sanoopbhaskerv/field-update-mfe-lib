Feature: Role-Aware Flows
  As a user of the Client Updater App
  My accessible functionality should depend on my active role

  Background:
    # Clear role ensures default advisor role or whatever we override

  Scenario: Advisor can only see their own clients
    Given I log in as an "advisor"
    And the app is open at the home page
    Then I should see the advisor home page
    When I search for "Alice"
    Then I should see a search result for "Alice Johnson"
    When I search for "Carol"
    Then I should see a no-results message

  Scenario: Support staff can act on behalf of an advisor
    Given I log in as "support_staff"
    And the app is open at the home page
    Then I should see the support staff home page
    When I click "Work on Behalf of Advisor →"
    Then I should be redirected to "/select-advisor" with no client ID in the URL
    When I enter "adv-2" as the advisor ID and submit
    Then I should be redirected to "/" with no client ID in the URL
    And I should see the advisor context banner for "James Carter"
    When I search for "Carol"
    Then I should see a search result for "Carol Martinez"

  Scenario: Support staff can look up a client directly by ID
    Given I log in as "support_staff"
    And the app is open at the home page
    When I lookup client ID "c-3"
    Then the client profile should load automatically
    And I should see a client named "Carol Martinez"
