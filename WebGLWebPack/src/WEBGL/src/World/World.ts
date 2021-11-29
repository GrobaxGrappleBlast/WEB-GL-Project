import { gl } from "./../BaseObject/GL/webGlUtil";
import { IDrawable } from "./../BaseObject/IDrawable";
import { toRadians } from "./../Math/TSM_Library/constants";
import { mat4 } from "./../Math/TSM_Library/mat4";
import { vec3 } from "./../Math/TSM_Library/vec3";
import { FileRequest } from '../Loader/FileReuqest';
import { JSON3D } from "../Loader/Assets/Loaders/JSONAssetLoader";
import { Mesh } from '../BaseObject/Components/Mesh';
import { Drawable, DefaultCube } from '../BaseObject/Drawable';
import { DefaultShader, Shader } from '../BaseObject/GL/Shader';
import { Texture, LoadableTexture } from '../BaseObject/Components/Texture';
import { Material } from '../BaseObject/Components/Material';

   

    abstract class AWorld{
        private camPos      = new vec3([-50,0,0]);
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

        private _assets : Drawable[] = [];
        private _asset : Drawable;
        //private _shader : Shader;
        private _mat : Material;
        public _tex : Texture; 

        public bind(): void{

            this._mat.use();
            this._mat.updateUniform_World(      GLOBAL_WORLD.worldMatrix);
            this._mat.updateUniform_Camera(     GLOBAL_WORLD.viewMatrix );
            this._mat.updateUniform_Projection( GLOBAL_WORLD.projMatrix )

           // this._shader.use();
            //gl.uniformMatrix4fv(this._shader.getUniformLocation("worldMatrix"), false, GLOBAL_WORLD.worldMatrix.values );
            //gl.uniformMatrix4fv(this._shader.getUniformLocation("viewMatrix") , false, GLOBAL_WORLD.viewMatrix.values  );
            //gl.uniformMatrix4fv(this._shader.getUniformLocation("projMatrix") , false, GLOBAL_WORLD.projMatrix.values  );
            this._tex.bind();
        }

        // # DRAWABLE IMPLEMENTATION 
        public draw(): void {
            this.bind();
            this._assets.forEach(a => {
                a.draw();
            });
           //this._asset.draw();
            GLOBAL_WORLD.rotateWorld(0.005)
        }

        public constructor(){
            super();
            this._mat = new Material("default");
            GLOBAL_WORLD = this;
            //this._assets = [];
            //this._shader = new DefaultShader("default");
            this._asset = new DefaultCube( this._mat);
            
            this._tex = new LoadableTexture("resources\\3d\\broken_steampunk_clock\\textures\\Material_3_baseColor.png");
            var fr = new FileRequest("resources\\3d\\broken_steampunk_clock\\test.json", this);
        }

        public onFileRecieved( asset : any){
        
            console.log("ON FILE RECIEVED ");
            var ASSET : JSON3D = asset.data;        
            
            var length :number = ASSET.meshes.length;
            
            var _meshes : Mesh[] = [];
            
            for (let i = 0; i < length; i++)
            {
                var mesh = ASSET.meshes[i];
                var faceArr:number[] = [];
                faceArr = [].concat.apply( [] , mesh.faces );

                _meshes.push( new Mesh(
                    mesh.vertices,
                    mesh.texturecoords[0],
                    faceArr    ,
                    mesh.normals
                ));
            }
            
            this._asset.setMesh(_meshes[0], this._mat);
            
            _meshes.forEach(mesh => {
                this._assets.push(new DefaultCube(this._mat));  
            });

            for (let i = 0; i < _meshes.length; i++) {
                this._assets[i].setMesh(_meshes[i] , this._mat )
            }

            console.log("LENGTH HAS BECOME " + this._assets.length);
            
        }    
    }

