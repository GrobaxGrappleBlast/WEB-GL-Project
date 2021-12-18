import { gl } from "./../BaseObject/GL/webGlUtil";

import { toRadians } from "./../Math/TSM_Library/constants";
import { vec3 } from "./../Math/TSM_Library/vec3";
import { FileRequest } from '../Loader/FileReuqest';
import { JSON3D, Material, Mesh, Light, Camera, NodeElement, JSON_3DSCENE_SORTER } from '../Loader/Assets/Loaders/JSONAssetLoader';
import { GLMesh } from '../BaseObject/Components/GLMesh';

import { DefaultShader, GLShader } from '../BaseObject/GL/GLShader';
import { GLTexture, LoadableTexture, CubeMapTexture, ITexture } from '../BaseObject/Components/GLTexture';
import { GLMaterial, TextureDataInput, BackgroundMaterial } from '../BaseObject/Components/GLMaterial';
import { Euler, Quaternion } from 'three';
import { GLAMaterial as MMat} from "../BaseObject/Components/GLMaterial"  

import { mat4 } from '../Math/TSM_Library/mat4';
import { IFileRequestResponse } from '../Loader/IFileRequestResponse';
import { mat3 } from '../Math/TSM_Library/mat3';
import { GLCamera } from '../BaseObject/Components/GLCamera';
import { GLPointLight } from '../BaseObject/Components/GLLight';
import { CONTEXT } from '../Context';

    export class World{
        
        public worldMatrix  : mat4 = mat4.getIdentity(); 
        public static testLight : GLPointLight;

        private startPos : vec3 = new vec3([5,5,5]);
        private rotAngle : vec3 = new vec3([0,0,1]).normalize();
        private rotMAT   : mat3 = mat3.getIdentity();

        public constructor(){
            CONTEXT.ActiveWorld = this; 
            CONTEXT.ActiveCamera = new GLCamera(new vec3([5,5,5]),new vec3([ 0,0,0]),new vec3([ 0,0,1]), 90);
        }
        
        getWorldMatrix():  mat4 {
            return this.worldMatrix;
        }
        
        public rotateWorld(angle:number){
            this.rotMAT.rotate(angle,this.rotAngle);
            CONTEXT.ActiveCamera.position = this.rotMAT.multiplyVec3(this.startPos,CONTEXT.ActiveCamera.position);
        }


    }

    export class AWorld extends World implements IFileRequestResponse{


        public constructor(){
            super();
            var a = new FileRequest("resources\\sphere.json", this);
        }
 
        public onFileRecieved( asset : any){
           
            var JSON : JSON_3DSCENE_SORTER = asset.data; 
            
            CONTEXT.PreLoadCubeTexture([
                "resources\\images\\cm_back.png                     ",
                "resources\\images\\cm_bottom.png                   ",
                "resources\\images\\cm_front.png                    ",
                "resources\\images\\cm_left.png                     ",
                "resources\\images\\cm_right.png                    ",
                "resources\\images\\cm_top.png                      ",
            ]);

            
            function setMatMesh( matName : string , mesh : GLMesh , texReqs : TextureDataInput[] = null, texCubReqs : TextureDataInput[] = null ){
               
                var meshName = mesh.name;
                var meshIndi = mesh.Index;

                CONTEXT.requestMaterialIndex( new GLMaterial(matName,texReqs,texCubReqs) )
                CONTEXT.registerMesh(mesh); // fail save 

                CONTEXT.MESHES.getHash(meshName).MaterialIndex = CONTEXT.requestMaterialIndexHash(matName);
                CONTEXT.MATERIALS.getHash(matName)._meshIndicees.push( meshIndi );
            }
            
            console.log("---");
            var mesh : GLMesh;
            mesh =  JSON.getMeshes()[0];
            var texs : TextureDataInput[] = [
                new TextureDataInput("diffuse","resources\\images\\RTS_Crate.jpg"),
                new TextureDataInput("normal" ,"resources\\images\\normalmap.png"),
            ]

            // THE CUBE TEXTURES ASSUMES THAT THEY HAVE ALREADY BEEN GATHERED IN THE CONTEXT;
            var texCub: TextureDataInput[] =[
                new TextureDataInput("reflection" ,"resources\\images\\cm_back.png"),
            ]
            setMatMesh("MATERIAL_NAME_01", mesh, texs , texCub );

            console.log("---");
            mesh = new GLMesh(
                [   -2 , -1 , -1 ,-2 , -5 , -1 ,
                     2 , -1 , -1 , 2 , -5 , -1 ,
                ],[0,1,1,1,0,0,1,0],[0,1,2,3,2,1]);
            mesh.name = "floor";
            setMatMesh("MATERIAL_FLOOR", mesh);

            console.log("---");
            mesh = new GLMesh(
                [ 0.25, -0.5 ,  0.75 ,0.25, -0.5 , -1.75 ,
                 -1.25, -0.5 ,  0.75 ,-1.25, -0.5 , -1.75 ,
              ],[ 0,1,1,1,0,0,1,0],[0,1,2,3,2,1] );
            mesh.name = "wall_01";
            setMatMesh("MATERIAL_WALL", mesh);

            console.log("---");
            mesh = new GLMesh(
                    [   -1 , -1   ,  0,-1 , -1   , -3,
                        -1 , -2.5 ,  0,-1 , -2.5 , -3,
                        ],[0,1,1,1,0,0,1,0],[0,1,2,3,2,1]
                );
            mesh.name = "wall_02";
            setMatMesh("MATERIAL_WALL", mesh);

         
            World.testLight = new GLPointLight( new vec3( [0,0,0]));

        }

        
    }

