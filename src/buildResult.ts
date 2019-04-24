import { BaseBuildResult, BasicTypeBuildAsset, BufferBuildAsset, FileBuildAsset } from 'webext-buildtools-utils';

export class ChromeCrxBuildResult extends BaseBuildResult<{
    crxFile?: FileBuildAsset;
    crxBuffer?: BufferBuildAsset;
    updateXmlFile?: FileBuildAsset;
    updateXmlBuffer?: BufferBuildAsset;
}> 
{
}
