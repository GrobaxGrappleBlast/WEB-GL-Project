import { gl } from "./../BaseObject/GL/webGlUtil";
import { IDrawable } from "./../BaseObject/IDrawable";
import { toRadians } from "./../Math/TSM_Library/constants";
import { mat4 } from "./../Math/TSM_Library/mat4";
import { vec3 } from "./../Math/TSM_Library/vec3";
import { FileRequest } from '../Loader/FileReuqest';
import { JSON3D } from "../Loader/Assets/Loaders/JSONAssetLoader";
import { Mesh } from '../BaseObject/Components/Mesh';
import { Drawable, DefaultCube } from '../BaseObject/Drawable';

   

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

    export var GLOBAL_WORLD:World;
    export class World extends AWorld{

        // #########################
        // SINGLE TON IMPLEMENTATION 
        /*public static getInstance():World{
            throw new Error("NABA");
            if( GLOBAL_WORLD == undefined ){
                console.log("CREATING NEW WORLD");
                GLOBAL_WORLD = new World();
            }
            return GLOBAL_WORLD;
        }*/

        // # DRAWABLE IMPLEMENTATION 
        public draw(): void {
            this._asset.draw();
        }

        // CONSTRUCTOR THINGIES 
        _asset: Drawable;

        public constructor(){
            super();
            GLOBAL_WORLD = this;
            this._asset = new DefaultCube();
            var fr = new FileRequest("resources\\3d\\broken_steampunk_clock\\test.json", this);
        }

        public onFileRecieved( asset : any){
            var ASSET : JSON3D = asset.data;
            var length :number = ASSET.meshes.length;
            console.log("MESH LENGTH IS " + length);

            var _meshes : Mesh[] = [];
            console.log(_meshes);
            
            for (let i = 0; i < length; i++)
            {
                var mesh = ASSET.meshes[i];
                var faceArr:number[] = [];
                var f = 0;

                mesh.faces.forEach(face => {
                    face.forEach( vertIndex => {
                        faceArr.push( vertIndex );
                    });
                });

                _meshes.push( new Mesh(
                    mesh.vertices,
                    mesh.texturecoords[0],
                    faceArr    
                ));
            }
            this._asset.setMesh(_meshes[0])
        }    
    }

