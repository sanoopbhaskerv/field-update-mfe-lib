Feature: Deeplink Entry - Load Client via Context ID
  As an external system linking to the app with a client context
  I want the app to resolve the context ID to a client profile
  So that the user sees the client detail directly without searching

  Scenario: Deeplink with a valid context ID loads the client
    Given I open the deeplink URL "/update/ctx-abc123"
    Then I should see a loading indicator
    And the client profile should load automatically
    And I should be redirected to "/client" with no client ID in the URL
    And I should see a client named "Alice Johnson"
    And I should see all 5 client attributes

  Scenario: Deeplink then edit an attribute
    Given I open the deeplink URL "/update/ctx-abc123"
    And the client profile is loaded
    When I click "Edit" next to "Phone Number"
    Then I should be on Step 1 of the wizard
    And the URL should be "/client/edit/phone"
    When I enter "+1 (555) 999-0000" as the new value
    And I click "Review Changes"
    Then I should be on Step 2 of the wizard at URL "/client/verify"
    When I click "Confirm & Save"
    Then I should be on Step 3 of the wizard at URL "/client/confirmation"
    And I should see a success message

  Scenario: Deeplink with an invalid context ID shows an error
    Given I open the deeplink URL "/update/ctx-invalid-xyz"
    Then I should see an error message about invalid or expired context
    And I should see a "Back to Search" link

  Scenario: No client ID appears in any URL during deeplink flow
    Given I open the deeplink URL "/update/ctx-def456"
    And the client profile is loaded
    Then the URL should not contain "2"
    When I click "Edit" next to "Full Name"
    Then the URL should not contain "2"
    When I enter "Bob W. Williams" as the new value
    And I click "Review Changes"
    Then the URL should not contain "2"
    When I click "Confirm & Save"
    Then the URL should not contain "2"
