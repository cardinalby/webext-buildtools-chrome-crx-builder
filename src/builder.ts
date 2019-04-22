import * as fs from 'fs-extra';
import { ISimpleBuilder } from 'webext-buildtools-builder-types';
import { AbstractSimpleBuilder, BufferBuildAsset, FileBuildAsset } from 'webext-buildtools-utils';
import { IChromeCrxOptions } from '../declarations/options';
import { ChromeCrxBuildResult } from './buildResult';
import { CrxWrapper } from './crxWrapper';

export interface IWebextManifest {
    name: string;
    version: string;
    [key: string]: any;
}

// noinspection JSUnusedGlobalSymbols
/**
 * ISimpleBuilder wrapper of crx package
 */
export class ChromeCrxBuilder
    extends AbstractSimpleBuilder<IChromeCrxOptions, ChromeCrxBuildResult>
    implements ISimpleBuilder<ChromeCrxBuildResult>
{
    public static readonly TARGET_NAME = 'chrome-zip2crx';

    protected _inputZipBuffer?: Buffer;
    protected _inputManifest?: IWebextManifest;
    protected _crxFileRequirement?: boolean;  // temp or not
    protected _isCrxBufferRequired: boolean = false;
    protected _updateXmlFileRequirement?: boolean;
    protected _isUpdateXmlBufferRequired: boolean = false;

    public getTargetName(): string {
        return ChromeCrxBuilder.TARGET_NAME;
    }

    // noinspection JSUnusedGlobalSymbols
    public setInputZipBuffer(buffer: Buffer): this {
        this._inputZipBuffer = buffer;
        return this;
    }

    public setInputManifest(manifest: IWebextManifest): this {
        if (!manifest.name || !manifest.version) {
            throw Error('Invalid manifest object, id and name fields are required');
        }
        this._inputManifest = manifest;
        return this;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * this.setInputZipBuffer() should be called before build
     */
    public requireCrxFile(temporary: boolean = false): this {
        this._crxFileRequirement = !!temporary;
        return this;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * this.setInputZipBuffer() should be called before build
     */
    public requireCrxBuffer(): this {
        this._isCrxBufferRequired = true;
        return this;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * this.setInputManifest() should be called before build
     */
    public requireUpdateXmlFile(temporary: boolean = false): this {
        this._updateXmlFileRequirement = !!temporary;
        return this;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * this.setInputManifest() should be called before build
     */
    public requireUpdateXmlBuffer(): this {
        this._isUpdateXmlBufferRequired = true;
        return this;
    }

    public async build(): Promise<ChromeCrxBuildResult> {
        this.validateOptions();
        if (this.isOutputCrxRequired() && !this._inputZipBuffer) {
            throw new Error('Input zip buffer is not set, but it is required for crx output');
        }

        const result = new ChromeCrxBuildResult();
        if (!this.isOutputUpdateXmlRequired() && !this.isOutputCrxRequired()) {
            this._logWrapper.warn('Output assets are not required, do nothing');
            return result;
        }

        if (this.isOutputUpdateXmlRequired()) {
            if (!this._inputManifest) {
                throw new Error('Input manifest is required to produce updateXml file or buffer output');
            }
            if (!this._inputManifest.update_url) {
                this._logWrapper.warn(
                    "UpdateXml output required, but manifest file doesn't have 'update_url' key. " +
                        'See https://developer.chrome.com/apps/autoupdate for details',
                );
            }
        }

        const crxWrapper = await this.createCrxWrapper();

        if (this.isOutputCrxRequired()) {
            this._logWrapper.info('Building crx...');
            await this.buildCrx(result, crxWrapper);
        }

        if (this.isOutputUpdateXmlRequired()) {
            this._logWrapper.info('Building updateXml...');
            await this.buildUpdateXml(result, crxWrapper);
        }

        return result;
    }

    protected async buildCrx(result: ChromeCrxBuildResult, crxWrapper: CrxWrapper) {
        // @ts-ignore
        const crxBuffer = await crxWrapper.pack(this._inputZipBuffer);

        if (this._isCrxBufferRequired) {
            result.getAssets().crxBuffer = new BufferBuildAsset(crxBuffer);
        }

        if (this._crxFileRequirement === false) {
            result.getAssets().crxFile = await FileBuildAsset.writeAndCreatePersistent(
                this._options.crxFilePath as string,
                crxBuffer,
            );
        } else if (this._crxFileRequirement === true) {
            result.getAssets().crxFile = await FileBuildAsset.writeAndCreateTemporary(
                'crx_',
                'extension.crx',
                crxBuffer,
            );
        }

        const crxFileAsset = result.getAssets().crxFile;
        if (crxFileAsset) {
            this._logWrapper.info(`Crx file saved to '${crxFileAsset.getValue()}'`);
        }
    }

    protected async buildUpdateXml(result: ChromeCrxBuildResult, crxWrapper: CrxWrapper) {
        const updateXmlBuffer = crxWrapper.generateUpdateXML(
            // @ts-ignore
            this._inputManifest.version,
            // @ts-ignore
            this._options.updateXml.codebaseUrl,
            // @ts-ignore
            this._options.updateXml.appId,
        );

        if (this._isUpdateXmlBufferRequired) {
            result.getAssets().updateXmlBuffer = new BufferBuildAsset(updateXmlBuffer);
        }

        if (this._updateXmlFileRequirement === false) {
            result.getAssets().updateXmlFile = await FileBuildAsset.writeAndCreatePersistent(
                // @ts-ignore
                this._options.updateXml.outFilePath,
                updateXmlBuffer,
            );
        } else if (this._updateXmlFileRequirement === true) {
            result.getAssets().updateXmlFile = await FileBuildAsset.writeAndCreateTemporary(
                'updateXml_',
                'extensionUpdate.xml',
                updateXmlBuffer,
            );
        }

        const updateXmlFileAsset = result.getAssets().updateXmlFile;
        if (updateXmlFileAsset) {
            this._logWrapper.info(`UpdateXml file saved to '${updateXmlFileAsset.getValue()}'`);
        }
    }

    protected validateOptions() {
        const requiredFields: string[] = [];

        if (this._crxFileRequirement === false && !this._options.crxFilePath) {
            requiredFields.push("'crxFilePath'");
        }

        if (!this._options.privateKey && !this._options.privateKeyFilePath) {
            requiredFields.push("'privateKey' or 'privateKeyFilePath'");
        }

        const missedFields = requiredFields.filter(
            (field: string) => typeof (this._options as any)[field] === 'undefined',
        );

        if (this._options.updateXml) {
            if (!this._options.updateXml.codebaseUrl) {
                if (this.isOutputUpdateXmlRequired()) {
                    missedFields.push("'updateXml.codebaseUrl'");
                } else {
                    this._logWrapper.warn("Missed 'codebaseUrl' key in 'updateXml' option");
                }
            }

            if (!this._options.updateXml.outFilePath &&
                // updateXml file required as not temporary
                this._updateXmlFileRequirement === false
            ) {
                missedFields.push("'updateXml.outFilePath'");
            }
        }

        if (missedFields.length > 0) {
            throw Error('Missed options fields: ' + missedFields.join(', '));
        }
    }

    protected async createCrxWrapper(): Promise<CrxWrapper> {
        if (this._options.privateKey) {
            return new CrxWrapper(this._options.privateKey);
        }
        // @ts-ignore
        return new CrxWrapper(await fs.readFile(this._options.privateKeyFilePath));
    }

    protected isOutputUpdateXmlRequired(): boolean {
        return this._updateXmlFileRequirement !== undefined || this._isUpdateXmlBufferRequired;
    }

    protected isOutputCrxRequired(): boolean {
        return this._crxFileRequirement !== undefined || this._isCrxBufferRequired;
    }
}
