[![Build Status](https://travis-ci.com/cardinalby/webext-buildtools-chrome-crx-builder.svg?branch=master)](https://travis-ci.com/cardinalby/webext-buildtools-chrome-crx-builder)
### Introduction
*webext-buildtools* builder for packing and signing Chrome Web Extension for offline distribution built 
on base of [crx](https://github.com/oncletom/crx) package.

If you need a **complete solution** for Web Extension build/deploy, go to 
[webext-buildtools-integrated-builder](https://github.com/cardinalby/webext-buildtools-integrated-builder) repo.  

To read what are *webext-buildtools* and *builders* go to 
[webext-buildtools-builder-types](https://github.com/cardinalby/webext-buildtools-builder-types) repo.

### Installation
`npm install webext-buildtools-chrome-crx-builder`

### Purpose
Builder allows you to build and sign your Web Extension for offline distribution. 
Read more details at [Alternative Extension Distribution Options](https://developer.chrome.com/apps/external_extensions).

### Usage example
```js
const ChromeCrxBuilder = require('webext-buildtools-chrome-crx-builder').default;
const fs = require('fs-extra');

const options = { ... }; // see description below
const logMethod = console.log;
const builder = new ChromeCrxBuilder(options, logMethod);

// if you omit manifest it will be extracted from the zip buffer
builder.setInputManifest(await fs.readJson('./ext_dir/package.json'))
builder.setInputZipBuffer(await fs.read('./packed.zip'));

builder.requireCrxFile();
builder.requireUpdateXmlFile();

const buildResult = await builder.build();
```

### Options
Options object described in [declarations/options.d.ts](declarations/options.d.ts)

[See](https://github.com/cardinalby/webext-buildtools-integrated-builder/blob/master/logMethod.md) how to get `logMethod` for pretty output.

### Inputs
1. **`setInputManifest(...)`**. Object with parsed extension's `package.json`. 
Required to produce `update.xml` file. If omitted, will be extracted from zip buffer.
2. **`setInputZipBuffer(...)`**. Buffer with zipped extension dir. Required to produce packed `crx` file

You can use [webext-buildtools-dir-reader-mw](https://www.npmjs.com/package/webext-buildtools-dir-reader-mw)
to generate needed inputs from extension directory.

### Outputs
#### crx
packed and signed (using private key specified in options) crx file <br>

*Required options:* `privateKey` or `privateKeyFilePath`, `crxFilePath` for file <br>
*Require methods:* `requireCrxFile()`, `requireCrxBuffer()` <br>
*Assets:* <br> 
`const buffer = buildResult.getAssets().crxBuffer.getValue()`<br>
`const crxFilePath = buildResult.getAssets().crxFile.getValue()`

#### update.xml 
updateXML for extensions hosted not on Chrome Web Store. This xml is used as response 
at url, specified in manifest's `update_url` key. 
See [https://developer.chrome.com/apps/autoupdateBuffer](https://developer.chrome.com/apps/autoupdateBuffer) 
for details.       

*Required options:* `updateXml.outFilePath` (for not temporary file), `updateXml.codebaseUrl` <br>
*Require methods:* `requireUpdateXmlFile()`, `requireUpdateXmlBuffer()` <br>
*Assets:* <br>
`const buffer = buildResult.getAssets().updateXmlBuffer.getValue()`<br>
`const xmlFilePath = buildResult.getAssets().updateXmlFile.getValue()`    