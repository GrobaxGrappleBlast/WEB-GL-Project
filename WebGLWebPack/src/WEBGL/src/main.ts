import { WebGLUtil } from "./BaseObject/GL/webGlUtil";
import { AssetManager } from "./Loader/Assets/AssetManager";
import { MessageBus } from "./Loader/Message/MessageBus";
import { testClass } from "./test";
import { FileRequest } from './Loader/FileReuqest';
import { IFileRequestResponse } from './Loader/IFileRequestResponse';
import { CONTEXT, Context } from './Context';
import { World } from "./World/World";
    

    export class startClass implements IFileRequestResponse{

        
        public static canvas : HTMLCanvasElement;

        public constructor(){
            this.init();               
        }

        public onFileRecieved(asset: any) {
           console.log(asset);
        }

        public init(): void{
            startClass.canvas = WebGLUtil.initialize("canvas");
            AssetManager.initialize();
            var a : Context = new Context();
            requestAnimationFrame(this.update.bind(this));
        }
        
        public update(){
            CONTEXT.RenderFrame();
            MessageBus.update(1);
            requestAnimationFrame(this.update.bind(this));
        }      

        public updateOther(val){
            //this.world.updateOther(val);
        }
        public updateFilter(val){
            //this.world.updateFilter(val);
        }

        public _e : testClass;
        public init_test(){
            AssetManager.initialize();
            WebGLUtil.initialize("c");
            this._e = new testClass();
        }

        

    }





