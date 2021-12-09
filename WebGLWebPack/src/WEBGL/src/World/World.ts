import { gl } from "./../BaseObject/GL/webGlUtil";

import { toRadians } from "./../Math/TSM_Library/constants";
import { vec3 } from "./../Math/TSM_Library/vec3";
import { FileRequest } from '../Loader/FileReuqest';
import { JSON3D, Material, Mesh, Light, Camera, NodeElement, JSON_3DSCENE_SORTER } from '../Loader/Assets/Loaders/JSONAssetLoader';
import { GLMesh } from '../BaseObject/Components/GLMesh';

import { DefaultShader, GLShader } from '../BaseObject/GL/GLShader';
import { GLTexture, LoadableTexture } from '../BaseObject/Components/GLTexture';
import { GLMaterial } from '../BaseObject/Components/GLMaterial';
import { GLLight } from '../BaseObject/Components/GLLIght';
import { GLCamera } from '../BaseObject/Components/GLCamera';
import { Euler, Quaternion } from 'three';
import { Node } from './Node';
import { mat4 } from '../Math/TSM_Library/mat4';
import { GLAnimation } from '../BaseObject/Components/GLAnimation';






    abstract class AWorld{
        public camPos      = new vec3([-100,0,0]);
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

        public MESHES      : GLMesh[] = [];
        public MATERIALS   : GLMaterial[];
        public NodeTree    : Node[]; 

        public animations : GLAnimation[] ;
        private loaded      : boolean = false;


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
            if(this.loaded == true)
                this.playAnimation();

            if(this.loaded == true){
                this.bind();
                this.MATERIALS.forEach( mat => {
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
            var fr = new FileRequest("resources\\3d\\broken_steampunk_clock\\test.json", this);
            this.chosenAnim = 0;
        }

        public onFileRecieved( asset : any){

            var sorter : JSON_3DSCENE_SORTER = asset.data;        
            
            this.MATERIALS = sorter.getMaterials();

            this.MESHES = sorter.getMeshes();

            this.NodeTree   = sorter.getNodeTree();

            this.animations = sorter.getAnimations();


           // this.chooseAnimation(  0 );
            this.loaded = true;

            GLOBAL_WORLD = this;

            var I : mat4 = new mat4();
            var offset = I.setIdentity().translate(new vec3([0.0,0.0,0.0]) );
            this.NodeTree[0].ApplyOffset( offset   , this.NodeTree   );    
        }
        
        private chosenAnim : number = 0;
        private frame : number = 0;

        public playAnimation( ){
            if( this.frame > this.animations[this.chosenAnim].getEnd() ){
                this.frame = this.animations[this.chosenAnim].getStart();
            }

           this.animations[this.chosenAnim].playKeyFrame(this.frame++);
        }

        
    }

