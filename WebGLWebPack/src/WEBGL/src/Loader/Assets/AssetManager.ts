import { Message } from "../Message/Message";
import { ImageAssetLoader } from "./Loaders/AssetLoader";
import { IAsset } from "./IAsset";
import { IAssetLoader } from "./Loaders/IAssetLoader";
import { JSONAssetLoader } from "./Loaders/JSONAssetLoader";

    // Source https://www.youtube.com/watch?v=_wvvtCqXwYY&list=PLv8Ddw9K0JPiTHLMQw31Yh4qyTAcHRnJx&index=7 
    export const MESSAGE_ASSET_LOADER_ASSET_LOADED = "LOADED::"
    export class AssetManager{

        private static _loaders: IAssetLoader[] = [];
        private static _loadedAssets: {[name:string]:IAsset } = {}

        private constructor(){
        }

        public static initialize():void{
            //console.log("IMAGE LOADER ADDED");
            AssetManager._loaders.push(new ImageAssetLoader());
            //console.log("JSON LOADER ADDED");
            AssetManager._loaders.push(new JSONAssetLoader());
           
        }

        public static registerLoader( loader: IAssetLoader ):void{
            AssetManager._loaders.push(loader);
        }
    
        public static onAssetLoaded(asset:IAsset):void{
            AssetManager._loadedAssets[asset.name] = asset;
            Message.send(
                MESSAGE_ASSET_LOADER_ASSET_LOADED + asset.name,
                this,
                asset
            );
        }

        public static loadAsset(assetName:string):void{
            let extension = assetName.split('.').pop().toLowerCase();
            for (let i = 0; i < AssetManager._loaders.length; i++) {
                let l = AssetManager._loaders[i];
                if( l.supportedExtensions.indexOf(extension) !== -1){
                    l.LoadAsset(assetName);
                    return;
                }
            }
            console.warn("Unable to Load Asset with extension of ::" + extension);
        }

        public static isAssetLoaded(assetName:string): boolean{
            return AssetManager._loadedAssets[assetName]  !== undefined;
        }

        public static getAsset(assetName:string):IAsset{
            if(AssetManager.isAssetLoaded(assetName)){
                return AssetManager._loadedAssets[assetName];
            }
            AssetManager.loadAsset(assetName);
            return undefined;
        }
    }


