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

        public static loadAsset(assetName:string):boolean{
            try{

                let extension = assetName.split('.').pop().toLowerCase().replace(/ /g, "");
                
                for (let i = 0; i < AssetManager._loaders.length; i++) {                    
                    let l = AssetManager._loaders[i];
                    var ext : string = "";

                    for (let a = 0; a < l.supportedExtensions.length; a++) {
                        ext = l.supportedExtensions[a];                        
                        if( ext == extension ){
                            l.LoadAsset(assetName);
                            return true;
                        }
                    }
                }
                return false;
                console.warn("Unable to Load Asset with extension of [" + extension+"]");
            }catch{
                console.log("ERROR AT EXTENSIION : WAS : " + assetName);
                return false;
            }
        }

        public static isAssetLoaded(assetName:string): boolean{
            return AssetManager._loadedAssets[assetName]  !== undefined;
        }

        public static getAsset(assetName:string){
            if(AssetManager.isAssetLoaded(assetName)){
                return AssetManager._loadedAssets[assetName];
            }
            AssetManager.loadAsset(assetName);
            
        }
    }


