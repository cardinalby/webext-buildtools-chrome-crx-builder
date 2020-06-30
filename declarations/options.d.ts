/**
 * Signing for offline distribution performs via crx package
 */
export interface IChromeCrxOptions {
    /** Provide either privateKey with privateKey itself or privateKeyFilePath */
    privateKey?: Buffer;
    /** Provide either privateKey with privateKey itself or privateKeyFilePath */
    privateKeyFilePath?: string;

    /** Output file path if not temporary crxFile output required */
    crxFilePath?: string;

    /**
     * This option needed only if UpdateXml output is required. For this output
     * builder generates an updateXML for extensions hosted not on Chrome Web Store
     * This xml is used as response at url, specified in manifest's 'update_url' key
     * @see https://developer.chrome.com/apps/autoupdate
     * If this option is specified, manifest either input or zip buffer are required for builder
     */
    updateXml?: IUpdateXmlOptions;
}

export interface IUpdateXmlOptions {
    /** Save to file if not temporary updateXml file required */
    outFilePath?: string;
    /** URL to the .crx file */
    codebaseUrl: string;
    /** if not specified it will be generated from privateKey */
    appId?: string;
}
