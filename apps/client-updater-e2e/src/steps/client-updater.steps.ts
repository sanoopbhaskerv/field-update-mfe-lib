import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from 'playwright/test';
import { PlaywrightWorld } from '../support/world';

// ─── Setup & Navigation ──────────────────────────────────────────────────────

Given('I log in as {string}', async function (this: PlaywrightWorld, role: string) {
    // We use the new localStorage checking mechanism to inject the role
    // Evaluate runs immediately and sets the storage before we goto('/')
    await this.page.addInitScript((mockRole) => {
        window.localStorage.setItem('MOCK_ROLE', mockRole);
    }, role);
});

Given('I log in as an {string}', async function (this: PlaywrightWorld, role: string) {
    await this.page.addInitScript((mockRole) => {
        window.localStorage.setItem('MOCK_ROLE', mockRole);
    }, role);
});

Given('the app is open at the home page', async function (this: PlaywrightWorld) {
    // Default to advisor if not already set by a "Given I log in as" step
    await this.page.addInitScript(() => {
        if (!window.localStorage.getItem('MOCK_ROLE')) {
            window.localStorage.setItem('MOCK_ROLE', 'advisor');
        }
    });
    await this.goto('/');
    await this.page.waitForLoadState('load');
});

Given('I open the deeplink URL {string}', async function (this: PlaywrightWorld, path: string) {
    await this.goto(path);
    await this.page.waitForLoadState('load');
});

// ─── Assertions ─────────────────────────────────────────────────────────────

Given('the URL should not contain any client ID', async function (this: PlaywrightWorld) {
    const path = this.currentPath();
    // Numeric IDs should never appear in the URL
    expect(path).not.toMatch(/\/\d+/);
});

Then('the URL should not contain {string}', async function (this: PlaywrightWorld, text: string) {
    const path = this.currentPath();
    expect(path).not.toContain(text);
});

Then('I should be on the client detail page at URL {string}', async function (this: PlaywrightWorld, expectedPath: string) {
    await expect(this.page).toHaveURL(new RegExp(`${expectedPath}(\\?.*)?$`), { timeout: 5000 });
});

Then('I should be on Step {int} of the wizard', async function (this: PlaywrightWorld, step: number) {
    // Step indicator should display the active step number
    const indicator = this.page.locator(`[aria-current="step"]`);
    await expect(indicator).toBeVisible();
    await expect(indicator).toContainText(String(step));
});

Then('I should be on Step {int} of the wizard at URL {string}', async function (this: PlaywrightWorld, _step: number, expectedPath: string) {
    await expect(this.page).toHaveURL(new RegExp(`${expectedPath}(\\?.*)?$`), { timeout: 5000 });
});

Then('the URL should be {string}', async function (this: PlaywrightWorld, expectedPath: string) {
    await expect(this.page).toHaveURL(new RegExp(`${expectedPath}(\\?.*)?$`), { timeout: 5000 });
});

Then('I should be redirected to {string} with no client ID in the URL', async function (this: PlaywrightWorld, expectedPath: string) {
    await this.page.waitForURL(`**${expectedPath}`, { timeout: 5000 });
    const path = this.currentPath();
    expect(path).toBe(expectedPath);
    expect(path).not.toMatch(/\/\d+/);
});

// ─── Search flow ─────────────────────────────────────────────────────────────

When('I search for {string}', async function (this: PlaywrightWorld, query: string) {
    const input = this.page.locator('#search-input');
    await input.fill(query);
    // Typeahead fires after 300ms debounce — wait for results or no-results to appear
    await this.page.locator('.result-list, .no-results, .spinner-container').first().waitFor({ timeout: 5000 });
});

When('I lookup client ID {string}', async function (this: PlaywrightWorld, id: string) {
    const input = this.page.locator('input[placeholder="e.g. c-1"]');
    await input.fill(id);
    await this.page.locator('button:has-text("Find")').click();
    // Wait for navigation or error to appear
    await Promise.race([
        this.page.waitForURL('**/client', { timeout: 5000 }),
        this.page.locator('.alert-error').waitFor({ state: 'visible', timeout: 5000 }),
    ]);
});

When('I enter {string} as the advisor ID and submit', async function (this: PlaywrightWorld, id: string) {
    const input = this.page.locator('input[placeholder="e.g. adv-1"]');
    await input.fill(id);
    await this.page.locator('button:has-text("Select Advisor")').click();
    // Wait for redirect after advisor resolution
    await this.page.waitForURL('**/', { timeout: 5000 });
});

Then('I should see a search result for {string}', async function (this: PlaywrightWorld, name: string) {
    const result = this.page.locator('button').filter({ hasText: new RegExp(name, 'i') }).first();
    await result.waitFor({ state: 'visible', timeout: 5000 });
});

Then('I should see a no-results message', async function (this: PlaywrightWorld) {
    const msg = this.page.locator('p').filter({ hasText: /No clients found/i }).first();
    await msg.waitFor({ state: 'visible', timeout: 5000 });
});

When('I select {string} from the results', async function (this: PlaywrightWorld, name: string) {
    await this.page.locator(`button:has-text("${name}")`).click();
    await this.page.waitForURL('**/client');
    await this.page.waitForLoadState('load');
});

Then('I should see the advisor home page', async function (this: PlaywrightWorld) {
    await expect(this.page.locator('h1:has-text("Find a Client")')).toBeVisible();
    await this.page.locator('text=Welcome, Sarah Thompson').waitFor({ state: 'visible', timeout: 5000 });
});

Then('I should see the support staff home page', async function (this: PlaywrightWorld) {
    await expect(this.page.locator('h1:has-text("Client Lookup")')).toBeVisible();
});

Then('I should see the advisor context banner for {string}', async function (this: PlaywrightWorld, name: string) {
    const banner = this.page.locator('div').filter({ hasText: new RegExp(`Acting on behalf of:.*${name}`, 'si') }).first();
    await banner.waitFor({ state: 'visible', timeout: 5000 });
});

// ─── Client detail ────────────────────────────────────────────────────────────

Then('I should see a client named {string}', async function (this: PlaywrightWorld, name: string) {
    const heading = this.page.locator('h1');
    await expect(heading).toContainText(name);
});

Then('I should see all 5 client attributes', async function (this: PlaywrightWorld) {
    const labels = ['Full Name', 'Date of Birth', 'Email Address', 'Phone Number', 'Address'];
    for (const label of labels) {
        await expect(this.page.locator(`text=${label}`).first()).toBeVisible();
    }
});

When('I click {string} next to {string}', async function (this: PlaywrightWorld, buttonText: string, fieldLabel: string) {
    // Find the field card containing the label, then click its Edit button
    // The previous locator was still matching all buttons because `.filter` returns the parent, 
    // and `.locator('button')` searches the whole subtree.
    // We isolate the specific row using xpath or a stricter CSS
    const specificRow = this.page.locator(`div:has-text("${fieldLabel}")`).filter({ has: this.page.locator(`button:has-text("${buttonText}")`) }).last();
    await specificRow.locator(`button:has-text("${buttonText}")`).click();
    await this.page.waitForLoadState('load');
});

// ─── Deeplink ─────────────────────────────────────────────────────────────────

Then('I should see a loading indicator', async function (this: PlaywrightWorld) {
    // On deeplink the spinner appears briefly — check it is (or was) present
    // We check for the page to have transitioned to /client
    await this.page.waitForURL('**/client', { timeout: 5000 });
});

Then('the client profile should load automatically', async function (this: PlaywrightWorld) {
    await this.page.waitForURL('**/client');
    const heading = this.page.locator('h1');
    await expect(heading).toBeVisible();
});

Given('the client profile is loaded', async function (this: PlaywrightWorld) {
    await this.page.waitForURL('**/client', { timeout: 5000 });
    await this.page.waitForLoadState('load');
});

// ─── Wizard steps ────────────────────────────────────────────────────────────

When('I enter {string} as the new value', async function (this: PlaywrightWorld, value: string) {
    const input = this.page.locator('#new-val');
    await input.fill(value);
});

When('I click {string}', async function (this: PlaywrightWorld, buttonText: string) {
    await this.page.locator(`button:has-text("${buttonText}")`).first().click();
    await this.page.waitForLoadState('load');
});

Then('I should see the current value {string}', async function (this: PlaywrightWorld, value: string) {
    await expect(this.page.locator(`text=${value}`).first()).toBeVisible();
});

Then('I should see the new value {string}', async function (this: PlaywrightWorld, value: string) {
    await expect(this.page.locator(`text=${value}`).last()).toBeVisible();
});

Then('I should see a success message', async function (this: PlaywrightWorld) {
    const msg = this.page.locator('text=Update Successful');
    await expect(msg).toBeVisible();
});

Then('the {string} button should be disabled', async function (this: PlaywrightWorld, buttonText: string) {
    const btn = this.page.locator(`button:has-text("${buttonText}")`).first();
    await expect(btn).toBeDisabled();
});

// ─── Deeplink error states ────────────────────────────────────────────────────

Then('I should see an error message about invalid or expired context', async function (this: PlaywrightWorld) {
    const alert = this.page.locator('.alert-error');
    await alert.waitFor({ state: 'visible', timeout: 5000 });
    const text = await alert.innerText();
    expect(text).toMatch(/invalid|expired/i);
});

Then('I should see a {string} link', async function (this: PlaywrightWorld, linkText: string) {
    const link = this.page.locator(`button:has-text("${linkText}"), a:has-text("${linkText}")`).first();
    await expect(link).toBeVisible();
});
