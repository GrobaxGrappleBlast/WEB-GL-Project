import { WebGLUtil } from "./BaseObject/GL/webGlUtil";
import { AssetManager } from "./Loader/Assets/AssetManager";
import { MessageBus } from "./Loader/Message/MessageBus";
import { testClass } from "./test";
import { World } from "./World/World";

    export class startClass{

       
        public static canvas : HTMLCanvasElement;

        public constructor(){
            this.init();   
        }

        public init(): void{
            AssetManager.initialize();
            startClass.canvas = WebGLUtil.initialize("c");
            World.getInstance();
            requestAnimationFrame(this.update.bind(this));
        }
        public update(){
            World.getInstance().draw();
            MessageBus.update(1);
            requestAnimationFrame(this.update.bind(this));
        }

        public _e : testClass;
        public init_test(){
            AssetManager.initialize();
            //
            this._e = new testClass();
            this._e.InitDemo();
            requestAnimationFrame(this.update_test.bind(this));

        }
        public update_test(): void{
            this._e.update();
            MessageBus.update(1);
            requestAnimationFrame(this.update_test.bind(this));
        }

    }





