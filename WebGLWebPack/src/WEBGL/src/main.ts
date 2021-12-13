import { WebGLUtil } from "./BaseObject/GL/webGlUtil";
import { AssetManager } from "./Loader/Assets/AssetManager";
import { MessageBus } from "./Loader/Message/MessageBus";
import { testClass } from "./test";
import { GLOBAL_WORLD, World } from './World/World';
import { FileRequest } from './Loader/FileReuqest';
import { IFileRequestResponse } from './Loader/IFileRequestResponse';
    
    export class startClass implements IFileRequestResponse{

        
        public static canvas : HTMLCanvasElement;

        public constructor(){
            this.init();               
        }

        public onFileRecieved(asset: any) {
           console.log(asset);
        }
    
        private world : World
        public init(): void{
            AssetManager.initialize();
            startClass.canvas = WebGLUtil.initialize("canvas");
            this.world = new World();
            requestAnimationFrame(this.update.bind(this));
        }
        
        public update(){
            GLOBAL_WORLD.draw();
            MessageBus.update(1);
            requestAnimationFrame(this.update.bind(this));
        }      


        public updateOther(val){
            this.world.updateOther(val);
        }
        public updateFilter(val){
            this.world.updateFilter(val);
        }

        public _e : testClass;
        public init_test(){
            AssetManager.initialize();
            WebGLUtil.initialize("c");
            this._e = new testClass();
        }

        

    }





