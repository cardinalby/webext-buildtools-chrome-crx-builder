// Type definitions for crx 4.0.1
// Definitions by: cardinalby

declare module 'crx' {
    interface IChromeExtensionAttributes {
        appId?: string | null;
        rootDirectory?: string;
        publicKey?: Buffer | null;
        privateKey?: Buffer | string;
        codebase?: string | null;
        path?: string | null;
        src?: string;
    }

    class ChromeExtension {
        public appId: string | null;
        public rootDirectory: string;
        public publicKey: Buffer | null;
        public privateKey: Buffer | string;
        public codebase: string | null;
        public path: string | null;
        public src: string;

        public loaded: boolean;
        public manifest?: { version: string };

        public constructor(attrs: IChromeExtensionAttributes);

        /**
         * Packs the content of the extension in a crx file.
         *
         * @example
         *
         * crx.pack().then(function(crxContent){
         *  // do something with the crxContent binary data
         * });
         *
         */
        public pack(contentsBuffer: Buffer): Promise<Buffer>;

        /**
         * Loads extension manifest and copies its content to a workable path
         */
        public load(path: string): Promise<ChromeExtension>;

        /**
         * Writes data into the extension workable directory.
         *
         * @deprecated
         */
        public writeFile(path: string, data: Buffer): Promise<any>;

        /**
         * Generates a public key.
         *
         * BC BREAK `this.publicKey` is not stored anymore (since 1.0.0)
         * BC BREAK callback parameter has been removed in favor to the promise interface.
         *
         * @example
         *
         * crx.generatePublicKey(function(publicKey){
         *   // do something with publicKey
         * });
         */
        public generatePublicKey(): Promise<Buffer>;

        /**
         * Generates a SHA1 package signature.
         *
         * BC BREAK `this.signature` is not stored anymore (since 1.0.0)
         */
        public generateSignature(contents: Buffer): Buffer;

        /**
         * BC BREAK `this.contents` is not stored anymore (since 1.0.0)
         */
        public loadContents(): Promise<Buffer>;

        /**
         * Generates and returns a signed package from extension content.
         *
         * BC BREAK `this.package` is not stored anymore (since 1.0.0)
         */
        public generatePackage(signature: Buffer, publicKey: Buffer, contents: Buffer): Buffer;

        /**
         * Generates an appId from the publicKey.
         * Public key has to be set for this to work, otherwise an error is thrown.
         *
         * BC BREAK `this.appId` is not stored anymore (since 1.0.0)
         * BC BREAK introduced `publicKey` parameter as it is not stored any more since 2.0.0
         *
         * @param {Buffer|string} publicKey the public key to use to generate the app ID
         * @returns {string}
         */
        public generateAppId(publicKey: Buffer | string): string;

        /**
         * Generates an updateXML file from the extension content.
         *
         * BC BREAK `this.updateXML` is not stored anymore (since 1.0.0)
         */
        public generateUpdateXML(): Buffer;
    }

    export = ChromeExtension;
}
