import { Before, After, setWorldConstructor } from '@cucumber/cucumber';
import { PlaywrightWorld } from './world';

setWorldConstructor(PlaywrightWorld);

Before(async function (this: PlaywrightWorld) {
    await this.openBrowser();
});

After(async function (this: PlaywrightWorld) {
    await this.closeBrowser();
});
