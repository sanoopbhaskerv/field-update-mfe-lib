Feature: Direct Entry - Search and Update Client Attribute
  As an authorised user accessing the app directly
  I want to search for a client and update one of their attributes
  So that I can keep client data accurate without exposing PII in URLs

  Background:
    Given the app is open at the home page
    And the URL should not contain any client ID

  Scenario: Search for a client and view their details
    When I search for "Alice"
    Then I should see a search result for "Alice Johnson"
    When I select "Alice Johnson" from the results
    Then I should be on the client detail page at URL "/client"
    And I should see all 5 client attributes

  Scenario: Edit a client's email address through the full wizard
    When I search for "Alice"
    And I select "Alice Johnson" from the results
    And I click "Edit" next to "Email Address"
    Then I should be on Step 1 of the wizard
    And the URL should be "/client/edit/email"
    When I enter "alice.updated@example.com" as the new value
    And I click "Review Changes"
    Then I should be on Step 2 of the wizard at URL "/client/verify"
    And I should see the current value "alice.johnson@example.com"
    And I should see the new value "alice.updated@example.com"
    When I click "Confirm & Save"
    Then I should be on Step 3 of the wizard at URL "/client/confirmation"
    And I should see a success message

  Scenario: Edit a client's full name
    When I search for "Alice"
    And I select "Alice Johnson" from the results
    And I click "Edit" next to "Full Name"
    Then I should be on Step 1 of the wizard
    When I enter "Alice M. Johnson" as the new value
    And I click "Review Changes"
    Then I should be on Step 2 of the wizard at URL "/client/verify"
    When I click "Confirm & Save"
    Then I should see a success message

  Scenario: Cancel an edit and return to client detail
    When I search for "Alice"
    And I select "Alice Johnson" from the results
    And I click "Edit" next to "Phone Number"
    Then I should be on Step 1 of the wizard
    When I click "Cancel"
    Then I should be on the client detail page at URL "/client"

  Scenario: Validation prevents submitting the same value
    When I search for "Alice"
    And I select "Alice Johnson" from the results
    And I click "Edit" next to "Email Address"
    When I enter "alice.johnson@example.com" as the new value
    Then the "Review Changes" button should be disabled

  Scenario: Search returns no results
    When I search for "zzznoresults"
    Then I should see a no-results message
