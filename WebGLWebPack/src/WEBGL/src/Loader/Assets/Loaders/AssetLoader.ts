//https://github.com/travisvroman/NamorvTech/blob/master/src/Engine/Core/Assets/ImageAssetLoader.ts

import { AssetManager } from "../AssetManager";
import { IAsset } from "../IAsset";
import { IAssetLoader } from "./IAssetLoader";

    
    export class ImageAsset implements IAsset{
        public readonly name: string;
        public readonly data: HTMLImageElement;

        public constructor(name : string, data : HTMLImageElement){
            this.name = name;
            this.data = data;
        }
        public get width():number{
            return this.data.width;
        }
        public get Height():number{
            return this.data.height;
        }
    }

    export class ImageAssetLoader implements IAssetLoader{

        public get supportedExtensions(): string[]{
            return ["png","gif","jpg"];
        }

        public LoadAsset(assetName: string): void {
            let image: HTMLImageElement = new Image();
            image.onload = this.onImageLoaded.bind(this,assetName,image);
            image.src = assetName;
        }

        private onImageLoaded(assetName:string, image:HTMLImageElement):void{
           //console.log("onImageLoaded + assetName/image"+assetName+"/"+image);
            let asset = new ImageAsset(assetName, image);
            AssetManager.onAssetLoaded(asset);
        }
    }


  
