import { gl } from "./../BaseObject/GL/webGlUtil";

import { toRadians } from "./../Math/TSM_Library/constants";
import { vec3 } from "./../Math/TSM_Library/vec3";
import { FileRequest } from '../Loader/FileReuqest';
import { GLMesh } from '../BaseObject/Components/GLMesh';

import { DefaultShader, GLShader } from '../BaseObject/GL/GLShader';
import { GLTexture, LoadableTexture } from '../BaseObject/Components/GLTexture';
import { GLMaterial } from '../BaseObject/Components/GLMaterial';
import { GLLight } from '../BaseObject/Components/GLLIght';
import { GLCamera } from '../BaseObject/Components/GLCamera';
import { Euler, Quaternion } from 'three';
import { mat4 } from '../Math/TSM_Library/mat4';

    abstract class AWorld{
        public camPos      = new vec3([1,0,1]);
        public lookAt      = new vec3([ 0,0,0]);
        public zDirection  = new vec3([ 0,1,0]);

        public worldMatrix  : mat4 = mat4.getIdentity(); 
        public viewMatrix   : mat4 = mat4.lookAt( this.camPos, this.lookAt, this.zDirection);
        public projMatrix   : mat4 = mat4.perspective( toRadians(45), ( gl.canvas.width / gl.canvas.height), 0.1,1000 ); //mat4.orthographic(-10,10,-10,10,-10,10) 

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

        private rotVec : vec3 = new vec3([0.5,0.5,0.5]);
        public rotateWorld(angle:number){
            this.rotVec.add( new vec3([1.0,0.0,0.5]) )
            this.worldMatrix.rotate(angle, this.rotVec );
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
        //public NodeTree    : Node[]; 

        public bind(): void{
           
            this.MATERIALS.forEach( mat => {
                mat.use();
                mat.updateUniform_World(      GLOBAL_WORLD.worldMatrix);
                mat.updateUniform_Camera(     GLOBAL_WORLD.viewMatrix );
                mat.updateUniform_Projection( GLOBAL_WORLD.projMatrix )
                mat.bind();

            });
        }

        public draw(): void {

                this.bind();
                this.MATERIALS.forEach( mat => {
                    mat.use();
                    mat.bind();
                    mat._meshIndicees.forEach( index => {
                        this.MESHES[index].bind();
                        this.MESHES[index].draw();
                    });
                });
                
                GLOBAL_WORLD.rotateWorld(0.02)
            
        }

        public constructor(){
            super();
            GLOBAL_WORLD = this;
        
            this.MATERIALS  = []
            this.MATERIALS.push (new GLMaterial("DEFAULT"));
            this.MATERIALS[0]._meshIndicees.push(0);
            
            this.MESHES     = []
            this.MESHES.push(
                GLMesh.createTestMesh()
            );
            this.MESHES[0].loadShaderLocations(this.MATERIALS[0]);
            

        }
        
    }

