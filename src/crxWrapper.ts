///<reference path="../external_declarations/crx.d.ts"/>
/**
 * Provides convenient way to interact with 'crx' package
 */
import ChromeExtension = require('crx');

export class CrxWrapper {
    protected _crx: ChromeExtension;

    public constructor(privateKey: Buffer) {
        this._crx = new ChromeExtension({});
        this._crx.privateKey = privateKey;
        this._crx.loaded = true;
    }

    /**
     * Get packed and signed crx
     */
    public async pack(zipBuffer: Buffer): Promise<Buffer> {
        return this._crx.pack(zipBuffer);
    }

    /**
     * Generates an updateXML for extensions hosted not on Chrome Web Store
     * This xml is used as response at url, specified in manifest's 'update_url' key
     * @see https://developer.chrome.com/apps/autoupdate
     *
     * If appId isn't specified it will be generated from privateKey
     */
    public generateUpdateXML(extVersion: string, codebaseUrl: string, appId?: string): Buffer {
        this._crx.manifest = { version: extVersion };
        this._crx.codebase = codebaseUrl;
        if (appId) {
            this._crx.appId = appId;
        }
        return this._crx.generateUpdateXML();
    }
}
