import { gl } from "./../BaseObject/GL/webGlUtil";

import { toRadians } from "./../Math/TSM_Library/constants";
import { vec3 } from "./../Math/TSM_Library/vec3";
import { FileRequest } from '../Loader/FileReuqest';
import { JSON3D, Material, Mesh, Light, Camera, NodeElement, JSON_3DSCENE_SORTER } from '../Loader/Assets/Loaders/JSONAssetLoader';
import { GLMesh } from '../BaseObject/Components/GLMesh';

import { DefaultShader, GLShader } from '../BaseObject/GL/GLShader';
import { GLTexture, LoadableTexture, CubeMapTexture } from '../BaseObject/Components/GLTexture';
import { GLMaterial, CubeMaterial, TextureDataInput } from '../BaseObject/Components/GLMaterial';
import { Euler, Quaternion } from 'three';
import { Material as MMat} from "../BaseObject/Components/GLMaterial"  

import { mat4 } from '../Math/TSM_Library/mat4';
import { IFileRequestResponse } from '../Loader/IFileRequestResponse';

    abstract class AWorld{
        public camPos      = new vec3([5,5,5]);
        public lookAt      = new vec3([ 0,0,0]);
        public zDirection  = new vec3([ 0,1,0]);

        public worldMatrix  : mat4 = mat4.getIdentity(); 
        public viewMatrix   : mat4 = mat4.lookAt( this.camPos, this.lookAt, this.zDirection);
        public projMatrix   : mat4 = mat4.perspective( toRadians(45), ( gl.canvas.width / gl.canvas.height), 0.1,1000 );

        reCalc(camPos:vec3, lookAt:vec3, up:vec3){
            this.viewMatrix   = mat4.lookAt( camPos, lookAt, up);
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
           
           // this.worldMatrix.rotate(angle, new vec3([0.5,0.5,1]) );
        }
    }

    export enum WorldMatrixNames{
        World       = "worldMatrix",
        Projection  = "projMatrix",
        View        = "viewMatrix" 
    };

    export var GLOBAL_WORLD:World;

    export class World extends AWorld implements IFileRequestResponse{

        public MESHES      : GLMesh[] = [];
        public MATERIALS   : MMat[] = [];
        private loaded      : boolean = false;


        public updateOther(val){
            this.MATERIALS.forEach(e  => {
                e.updateOther(val);
            });
        }

        public updateFilter(val){
            this.MATERIALS.forEach(e  => {
                e.updateFilter(val);
            });
        }

        public bind(): void{
            if(this.loaded)
            this.MATERIALS.forEach( mat => {
                mat.use();
                mat.updateUniform_World(      GLOBAL_WORLD.worldMatrix);
                mat.updateUniform_Camera(     GLOBAL_WORLD.viewMatrix );
                mat.updateUniform_Projection( GLOBAL_WORLD.projMatrix )
                mat.bind();
            });
        }

        public draw(): void {
            
            if(this.loaded == true){
                this.bind();
                this.MATERIALS.forEach( ( mat , i ) => {
                    mat.use();
                    mat.bind();
                    mat._meshIndicees.forEach( index => {
                        this.MESHES[index].bind();
                        this.MESHES[index].draw();
                    });
                });
                
                GLOBAL_WORLD.rotateWorld(0.005)
            
            }
        }

        public constructor(){
            super();
            GLOBAL_WORLD = this;
            var a = new FileRequest("resources\\sphere.json", this);
        }

        public onFileRecieved( asset : any){
            var JSON : JSON_3DSCENE_SORTER = asset.data; 
     
            this.MESHES.push( JSON.getMeshes()[0]);
            this.MATERIALS.push( new GLMaterial(
            "BaseMaterial",
            [
             new TextureDataInput("diffuse"     ,  GLTexture.createCheckers(8) ),
             new TextureDataInput("reflection"  ,  new CubeMapTexture() ),
            ]));
            //this.MATERIALS.push( new CubeMaterial("mymat") );
            this.MATERIALS[0]._meshIndicees.push(0);
            
            this.MESHES[0].loadShaderLocations(this.MATERIALS[0]);

            console.log("### ### ### ### ### ### ### ### ### ### ###");
            this.loaded = true;
        }

        
    }

