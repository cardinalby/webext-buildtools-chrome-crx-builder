import { zip } from 'zip-a-folder';
import * as path from "path";
import * as fs from 'fs-extra';
import ChromeCrxBuilder, {IChromeCrxOptions} from "../../dist";
import * as crypto from "crypto";

describe('crxBuilder', () => {
    const extensionDir = path.join(__dirname, 'extension');
    const extensionManifestFilePath = path.join(extensionDir, 'manifest.json');
    const outDirPath = path.join(__dirname, 'out');
    const privateKeyFilePath = path.join(outDirPath, 'private.pem');
    const zipFilePath = path.join(outDirPath, 'extension.zip');
    const crxFilePath = path.join(outDirPath, 'extension.crx');
    const updateXmlFilePath = path.join(outDirPath, 'update.xml');

    beforeAll(async () => {
        const privateKey = crypto.generateKeyPairSync("rsa", {
            modulusLength: 2048,
            publicKeyEncoding: {
                type: "pkcs1",
                format: "pem",
            },
            privateKeyEncoding: {
                type: "pkcs1",
                format: "pem",
            },
        }).privateKey;
        fs.writeFileSync(privateKeyFilePath, privateKey);

        await zip(extensionDir, zipFilePath);
    })

    afterEach(() => {
        if (fs.existsSync(crxFilePath)) {
            fs.rmSync(crxFilePath);
        }
        if (fs.existsSync(updateXmlFilePath)) {
            fs.rmSync(updateXmlFilePath);
        }
    })

    afterAll(() => {
        fs.emptyDirSync(outDirPath);
    })

    test.each([
        [true, false, true],
        [true, true, false],
        [false, false, false]
    ])(
        'build from zip, setManifestInput: %s, requireUpdateXml: %s, privateKeyFromFile: %s',
        async (setManifestInput, requireUpdateXml, privateKeyFromFile) => {
            const options = {
                crxFilePath: crxFilePath,
                privateKey: privateKeyFromFile ? undefined : fs.readFileSync(privateKeyFilePath),
                privateKeyFilePath: privateKeyFromFile ? privateKeyFilePath : undefined,
                updateXml : requireUpdateXml
                    ? {outFilePath: updateXmlFilePath, codebaseUrl: 'https://test.com/ex.crx'}
                    : undefined
            } as IChromeCrxOptions;
            const logMethod = console.log;
            const builder = new ChromeCrxBuilder(options, logMethod);
            if (setManifestInput) {
                builder.setInputManifest(await fs.readJson(extensionManifestFilePath))
            }
            builder.setInputZipBuffer(await fs.readFile(zipFilePath));
            builder.requireCrxFile();
            if (requireUpdateXml) {
                builder.requireUpdateXmlFile(false);
            }
            const buildResult = await builder.build();

            expect(buildResult.getAssets().crxFile?.getValue()).toEqual(crxFilePath);
            expect(fs.existsSync(crxFilePath)).toBeTruthy();
            if (requireUpdateXml) {
                expect(buildResult.getAssets().updateXmlFile?.getValue()).toEqual(updateXmlFilePath);
                expect(fs.existsSync(updateXmlFilePath)).toBeTruthy();
            } else {
                expect(buildResult.getAssets().updateXmlFile).toBeUndefined();
            }
            expect(buildResult.getAssets().crxBuffer).toBeUndefined();
        })
});