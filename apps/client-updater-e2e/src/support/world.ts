import { World, IWorldOptions } from '@cucumber/cucumber';
import { Browser, BrowserContext, Page, chromium } from 'playwright';

export interface WorldParams {
    baseUrl: string;
}

/**
 * PlaywrightWorld — custom Cucumber World that manages a Playwright browser instance.
 * Opened once per scenario, closed in the After hook (see hooks.ts).
 */
export class PlaywrightWorld extends World {
    browser!: Browser;
    context!: BrowserContext;
    page!: Page;
    readonly baseUrl: string;

    constructor(options: IWorldOptions) {
        super(options);
        const params = options.parameters as WorldParams;
        this.baseUrl = params.baseUrl ?? 'http://localhost:4200';
    }

    async openBrowser(): Promise<void> {
        this.browser = await chromium.launch({ headless: true });
        this.context = await this.browser.newContext();
        this.page = await this.context.newPage();
    }

    async closeBrowser(): Promise<void> {
        await this.page?.close();
        await this.context?.close();
        await this.browser?.close();
    }

    /** Navigate to a path relative to baseUrl */
    async goto(path: string): Promise<void> {
        await this.page.goto(`${this.baseUrl}${path}`);
    }

    /** Current browser URL path (no origin) */
    currentPath(): string {
        const url = new URL(this.page.url());
        return url.pathname;
    }
}
