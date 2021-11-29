import { LoableDrawable } from "./../BaseObject/LoableDrawable";
import { gl } from "./../BaseObject/GL/webGlUtil";
import { IDrawable } from "./../BaseObject/IDrawable";
import { toRadians } from "./../Math/TSM_Library/constants";
import { mat4 } from "./../Math/TSM_Library/mat4";
import { vec3 } from "./../Math/TSM_Library/vec3";
import { DefaultCube } from '../BaseObject/Drawable';

   

    abstract class AWorld{
        private camPos      = new vec3([-5,0,0]);
        private lookAt      = new vec3([ 0,0,0]);
        private zDirection  = new vec3([ 0,1,0]);

        public worldMatrix  : mat4 = mat4.identity; 
        public viewMatrix   : mat4 = mat4.lookAt( this.camPos, this.lookAt, this.zDirection);
        public projMatrix   : mat4 = mat4.perspective( toRadians(45), ( gl.canvas.width / gl.canvas.height), 0.1,1000 );

        constructor(){
        }
        
        getWorldMatrix():  mat4 {
            return this.worldMatrix;
        }
        getViewMatrix():  mat4 {
            return this.viewMatrix;
        }
        getProjectionMatrix(): mat4 {
            return this.projMatrix;
        }

        public rotateWorld(angle:number){
            this.worldMatrix.rotate(angle, new vec3([0.5,0.5,1]) );
        }
    }

    export enum WorldMatrixNames{
        World       = "worldMatrix",
        Projection  = "projMatrix",
        View        = "viewMatrix" 
    };

    export class World extends AWorld{
        
        _asset: IDrawable;
        private constructor(){
            super();  
        }

        static GlobalWorld : World;
        
        public static getInstance():World{
            if( World.GlobalWorld == undefined)
            {World.GlobalWorld = new World();}
            World.GlobalWorld.load();
            return World.GlobalWorld;
        }

        private isloaded:boolean = false;
        public load(): void {         
            if(!this.isloaded) {
                this.isloaded = true;                
                this._asset = new DefaultCube();
            }
        }

        public draw(): void {
            this._asset.draw();
        }
    }

