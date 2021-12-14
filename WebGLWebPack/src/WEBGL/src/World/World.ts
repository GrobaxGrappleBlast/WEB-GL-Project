import { gl } from "./../BaseObject/GL/webGlUtil";

import { toRadians } from "./../Math/TSM_Library/constants";
import { vec3 } from "./../Math/TSM_Library/vec3";
import { FileRequest } from '../Loader/FileReuqest';
import { JSON3D, Material, Mesh, Light, Camera, NodeElement, JSON_3DSCENE_SORTER } from '../Loader/Assets/Loaders/JSONAssetLoader';
import { GLMesh } from '../BaseObject/Components/GLMesh';

import { DefaultShader, GLShader } from '../BaseObject/GL/GLShader';
import { GLTexture, LoadableTexture, CubeMapTexture } from '../BaseObject/Components/GLTexture';
import { GLMaterial, TextureDataInput, BackgroundMaterial } from '../BaseObject/Components/GLMaterial';
import { Euler, Quaternion } from 'three';
import { Material as MMat} from "../BaseObject/Components/GLMaterial"  

import { mat4 } from '../Math/TSM_Library/mat4';
import { IFileRequestResponse } from '../Loader/IFileRequestResponse';
import { mat3 } from '../Math/TSM_Library/mat3';

    abstract class AWorld{
        public FarPlaneCoordinate = 1000.0;

        
        public camPos      = new vec3([5,5,5]);
        public lookAt      = new vec3([ 0,0,0]);
        public zDirection  = new vec3([ 0,0,1]);

        public worldMatrix  : mat4 = mat4.getIdentity(); 
        public viewMatrix   : mat4 = mat4.lookAt( this.camPos, this.lookAt, this.zDirection);
        public projMatrix   : mat4 = mat4.perspective( toRadians(45), ( gl.canvas.width / gl.canvas.height), 0.1, this.FarPlaneCoordinate );

        
        
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



        private startPos : vec3 = new vec3([5,5,5]);
        private rotAngle : vec3 = new vec3([0,0,1]).normalize();
        private rotMAT   : mat3 = mat3.getIdentity();
        
        public rotateWorld(angle:number){

            this.rotMAT.rotate(angle,this.rotAngle);
            this.camPos = this.rotMAT.multiplyVec3(this.startPos,this.camPos);
            console.log("R");
            this.viewMatrix  = mat4.lookAt(  this.camPos , this.lookAt, this.zDirection);
            //this.worldMatrix.rotate(angle, new vec3([0.5,0.5,1]) );
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
                mat.bind()
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
                
                GLOBAL_WORLD.rotateWorld(0.01   )
            
            }
        }

        public constructor(){
            super();
            GLOBAL_WORLD = this;
            var a = new FileRequest("resources\\sphere.json", this);
        }
 
        public onFileRecieved( asset : any){
            var JSON : JSON_3DSCENE_SORTER = asset.data; 
     
            this.MATERIALS.push( new GLMaterial(
                "BaseMaterial_buptidu",[
                 new TextureDataInput("diffuse"     ,  GLTexture.createCheckers(8) ),
                 new TextureDataInput("normal"      ,  new LoadableTexture("resources\\images\\normalmap.png") ),
                 new TextureDataInput("reflection"  ,  new CubeMapTexture() ),
            ]));
            this.MESHES.push( JSON.getMeshes()[0]);
            this.MATERIALS[0]._meshIndicees.push(0);
            this.MESHES[0].loadShaderLocations(this.MATERIALS[0]);

            
            this.MATERIALS.push( new BackgroundMaterial(
                "reflection",[
                    new TextureDataInput("diffuse"     ,  GLTexture.createCheckers(8) ),
                    new TextureDataInput("reflection"  ,  new CubeMapTexture() ),
            ]));
            this.MESHES.push( GLMesh.createBackgroundFarPlaneMesh() );
            this.MATERIALS[1]._meshIndicees.push(1);
            this.MESHES[1].loadShaderLocations(this.MATERIALS[1]);
            

            this.MATERIALS.push( new GLMaterial(
                "FLOORMAT",[
                 //new TextureDataInput("diffuse"     ,  GLTexture.createCheckers(8) ),
                 new TextureDataInput("normal"      ,  new LoadableTexture("resources\\images\\normalmap.png") ),
                 //new TextureDataInput("reflection"  ,  new CubeMapTexture() ),
            ]));
            this.MESHES.push( new GLMesh(
                [
                    -2 , -1 , -1 ,
                    -2 , -5 , -1 ,
                     2 , -1 , -1 ,
                     2 , -5 , -1 ,
                ],[
                    0,1,
                    1,1,
                    0,0,
                    1,0
                ],[
                    0,1,2,
                    3,2,1
                ]

            ));
            this.MATERIALS[2]._meshIndicees.push(2);
            this.MESHES[2].loadShaderLocations(this.MATERIALS[2]);



           this.loaded = true;

        }

        
    }

