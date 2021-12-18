import { AttributeInfo } from "../GL/GLBuffer";
import { gl } from "../GL/webGlUtil";
import { GLBuffer } from "../GL/GLBuffer"
import { GLMaterial, GLAMaterial } from './GLMaterial';
import { mat4 } from '../../Math/TSM_Library/mat4';
import { ITransformable } from './ITransformable';
import { vec3 } from "../../Math/TSM_Library/vec3";
import { GLShader } from '../GL/GLShader';
import { CONTEXT } from '../../Context';

    abstract class MeshTracker{
        
        public Index         : number ;
        public MaterialIndex : number ;
        public name          : string;

    }
    export class GLMesh extends MeshTracker{

        //private transformLocation : WebGLUniformLocation = null;
        //private transform: mat4 = mat4.getIdentity();
    
        public verticies    : number[];
        public texCoords    : number[];
        public faceIndecies : number[];

        public constructor(
            verticies    : number[]= null,
            texCoords    : number[]= null,
            faceIndecies : number[]= null,
        ){
            super();
            this.verticies    = verticies    ;
            this.texCoords    = texCoords    ;
            this.faceIndecies = faceIndecies ;
        }

        public draw( shader : GLShader = null ){
            CONTEXT.drawMesh( this );             
        }
        
        private doubleSidedRender(){
            gl.disable(gl.CULL_FACE);
        }
        private frontRender(){
            gl.enable(gl.CULL_FACE);
            gl.cullFace(gl.BACK);
        }
        private backRender(){
            gl.enable(gl.CULL_FACE);
            gl.cullFace(gl.FRONT);
        }

        private CullingMethod = this.frontRender;

        public enableDoubleSidedRender(){
            this.CullingMethod = this.doubleSidedRender;
        }

        public enableFrontRender(){
            this.CullingMethod = this.frontRender;
        }
        public enableBackRender(){
            this.CullingMethod = this.backRender;
        }


        public static createBackgroundFarPlaneMesh(): GLMesh{

            var a = CONTEXT.FarPlaneCoordinate/10;
            var mesh =  new GLMesh(

                    [
                        -a,  a, -a,        -a,  a,  a,        a,  a,  a,        a,  a, -a,
                        -a,  a,  a,        -a, -a,  a,       -a, -a, -a,       -a,  a, -a,
                         a,  a,  a,         a, -a,  a,        a, -a, -a,        a,  a, -a,
                         a,  a,  a,         a, -a,  a,       -a, -a,  a,       -a,  a,  a,
                         a,  a, -a,         a, -a, -a,       -a, -a, -a,       -a,  a, -a,
                        -a, -a, -a,        -a, -a,  a,        a, -a,  a,        a, -a, -a
                    ],[
                        0, 0,       0, 1,      1, 1,     1, 0,
                        0, 0,       1, 0,      1, 1,     0, 1,
                        1, 1,       0, 1,      0, 0,     1, 0,
                        1, 1,       1, 0,      0, 0,     0, 1,
                        0, 0,       0, 1,      1, 1,     1, 0,
                        1, 1,       1, 0,      0, 0,     0, 1
                    ],[
                        0,  1,  2,           0,  2,  3,
                        5,  4,  6,           6,  4,  7,
                        8,  9,  10,          8,  10, 11,
                        13, 12, 14,          15, 14, 12,
                        16, 17, 18,          16, 18, 19,
                        21, 20, 22,          22, 20, 23
                    ]

            );
            return mesh;
               
        }


    }

