import { gl } from "./../BaseObject/GL/webGlUtil";

import { toRadians } from "./../Math/TSM_Library/constants";
import { vec3 } from "./../Math/TSM_Library/vec3";
import { FileRequest } from '../Loader/FileReuqest';
import { JSON3D, Material, Mesh, Light, Camera, NodeElement, JSON_3DSCENE_SORTER } from '../Loader/Assets/Loaders/JSONAssetLoader';
import { GLMesh } from '../BaseObject/Components/GLMesh';

import { DefaultShader, GLShader } from '../BaseObject/GL/GLShader';
import { GLTexture, LoadableTexture, CubeMapTexture, ITexture, WhiteSTDTexture } from '../BaseObject/Components/GLTexture';
import { GLMaterial, TextureDataInput, BackgroundMaterial } from '../BaseObject/Components/GLMaterial';
import { Euler, Quaternion } from 'three';
import { GLAMaterial as MMat} from "../BaseObject/Components/GLMaterial"  

import { mat4 } from '../Math/TSM_Library/mat4';
import { IFileRequestResponse } from '../Loader/IFileRequestResponse';
import { mat3 } from '../Math/TSM_Library/mat3';
import { GLCamera } from '../BaseObject/Components/GLCamera';
import { GLPointLight } from '../BaseObject/Components/GLLight';

    abstract class AWorld{
        public FarPlaneCoordinate = 1000.0;

        
        // public camPos      = new vec3([5,5,5]);
        // public lookAt      = new vec3([ 0,0,0]);
        // public zDirection  = new vec3([ 0,0,1]);

        public worldMatrix  : mat4 = mat4.getIdentity(); 
        //public viewMatrix   : mat4 = mat4.lookAt( this.camPos, this.lookAt, this.zDirection);
        //public projMatrix   : mat4 = mat4.perspective( toRadians(45), ( gl.canvas.width / gl.canvas.height), 0.1, this.FarPlaneCoordinate );

        private Camera : GLCamera = new GLCamera(new vec3([5,5,5]),new vec3([ 0,0,0]),new vec3([ 0,0,1]), 90);
        public static testLight : GLPointLight;

        getActiveCameratPosition() : vec3 {
            return this.Camera.position;
        }

        getWorldMatrix():  mat4 {
            return this.worldMatrix;
        }
        getViewMatrix():  mat4 {
            return this.Camera.getViewMatrix() ;
        }
        getProjectionMatrix(): mat4 {
            return this.Camera.getProjectionMatrix();
        }

       


        private startPos : vec3 = new vec3([5,5,5]);
        private rotAngle : vec3 = new vec3([0,0,1]).normalize();
        private rotMAT   : mat3 = mat3.getIdentity();
        
        public rotateWorld(angle:number){

            this.rotMAT.rotate(angle,this.rotAngle);
            this.Camera.position = this.rotMAT.multiplyVec3(this.startPos,this.Camera.position);
            console.log("R");
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

        public staticShadowTexture;

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
                mat.updateUniform_World(      GLOBAL_WORLD.getWorldMatrix() );
                mat.updateUniform_Camera(     GLOBAL_WORLD.getViewMatrix() );
                mat.updateUniform_Projection( GLOBAL_WORLD.getProjectionMatrix() )
                mat.bind()
            });
        }

        public draw(): void {
            if(World.testLight){
                //World.testLight.renderShadow();
                this.staticShadowTexture = World.testLight.renderShadow();
            }
            if(this.loaded == true){
                this.bind();
                this.MATERIALS.forEach( ( mat , i ) => {
                    mat.use();
                    mat.bind();
                    mat._meshIndicees.forEach( index => {
                        this.MESHES[index].bind();
                        this.MESHES[index].draw();
                        this.MESHES[index].unbind();
                    });
                    mat.unBind();
                });
                
                GLOBAL_WORLD.rotateWorld(0.01   )
            
            }
        }

        public constructor(){
            super();
            GLOBAL_WORLD = this;
           
            var a = new FileRequest("resources\\sphere.json", this);
        }
 

        private MATINDEX = 0;
        private MESHINDX = 0;
        private addMaterialAndMesh(
            matname : string ,textures : TextureDataInput[], mesh : GLMesh[]
         ){
             this.MATERIALS.push( new GLMaterial(
                 matname,
                 textures
             ));

             for (let i = 0; i < mesh.length; i++) {
                 mesh[i].MaterialIndex = this.MATINDEX;
                this.MESHES.push( mesh[i] );
                this.MATERIALS[ this.MATINDEX ]._meshIndicees.push( this.MESHINDX );
                
                this.MESHINDX++;
             }
             this.MATINDEX++;
             
         }

        public onFileRecieved( asset : any){
            var JSON : JSON_3DSCENE_SORTER = asset.data; 
     
            /*
            this.addMaterialAndMesh("BaseMaterial_buptidu",
                [
                new TextureDataInput("diffuse"     ,  GLTexture.createCheckers(8) ),
                new TextureDataInput("normal"      ,  new LoadableTexture("resources\\images\\normalmap.png") ),
                new TextureDataInput("reflection"  ,  new CubeMapTexture() ),
                ],
                JSON.getMeshes()[0]
            );*/

            console.log("1");
            var m = GLMesh.createBackgroundFarPlaneMesh();
            m.enableBackRender();
            this.addMaterialAndMesh("reflection",
                [
                //new TextureDataInput("diffuse"     ,  GLTexture.createCheckers(8) ),
                new TextureDataInput("reflection"  ,  new CubeMapTexture() ),
                ],
                [m]
            );

            console.log("2");
            this.addMaterialAndMesh("FLOORMAT",
                [
                new TextureDataInput("diffuse"     ,  new LoadableTexture("resources\\images\\xamp23.png") ),
                new TextureDataInput("normal"      ,  new LoadableTexture("resources\\images\\normalmap.png") ),
                ],
                [new GLMesh(
                    [   -2 , -1 , -1 ,-2 , -5 , -1 ,
                         2 , -1 , -1 , 2 , -5 , -1 ,
                    ],[0,1,1,1,0,0,1,0],[0,1,2,3,2,1]) ]
            );

            console.log("3");
            var m1 : GLMesh = new GLMesh(
                [   0.25, -0.5 ,  0.75 ,0.25, -0.5 , -1.75 ,
                    -1.25, -0.5 ,  0.75 ,-1.25, -0.5 , -1.75 ,
                ],[
                    0,1,1,1,0,0,1,0],[0,1,2,3,2,1]    
            )
            var m2 : GLMesh = new GLMesh(
                [   -1 , -1   ,  0,-1 , -1   , -3,
                    -1 , -2.5 ,  0,-1 , -2.5 , -3,
                    ],[0,1,1,1,0,0,1,0],[0,1,2,3,2,1]
            );
            m2.enableDoubleSidedRender();
            m1.enableDoubleSidedRender();

            this.addMaterialAndMesh(
                "WALLMAT",
                [new TextureDataInput("diffuse"      ,  new WhiteSTDTexture( 255 )  ),
            ],

                [ m1 , m2]
            );


            World.testLight = new GLPointLight( new vec3( [0,0,0]));
            this.loaded = true;

        }

        
    }

