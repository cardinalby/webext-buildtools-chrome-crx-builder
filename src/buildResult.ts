import { BaseBuildResult, BasicTypeBuildAsset, BufferBuildAsset, FileBuildAsset } from 'webext-buildtools-utils';

export class CrxBufferAsset extends BasicTypeBuildAsset<Buffer> {}
export class UpdateXmlBufferAsset extends BasicTypeBuildAsset<Buffer> {}

export class ChromeCrxBuildResult extends BaseBuildResult<{
    crxFile?: FileBuildAsset;
    crxBuffer?: BufferBuildAsset;
    updateXmlFile?: FileBuildAsset;
    updateXmlBuffer?: BufferBuildAsset;
}> 
{
}
