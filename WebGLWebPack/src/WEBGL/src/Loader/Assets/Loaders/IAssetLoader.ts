
    //// Source https://www.youtube.com/watch?v=_wvvtCqXwYY&list=PLv8Ddw9K0JPiTHLMQw31Yh4qyTAcHRnJx&index=7 
    export interface IAssetLoader{
        readonly supportedExtensions : string[];       
        LoadAsset(assetName:string): void;
    }

