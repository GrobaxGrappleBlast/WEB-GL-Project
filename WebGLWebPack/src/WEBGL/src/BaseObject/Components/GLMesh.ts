import { AttributeInfo } from "../GL/GLBuffer";
import { gl } from "../GL/webGlUtil";
import { GLBuffer } from "../GL/GLBuffer"
import { GLMaterial, Material } from './GLMaterial';
import { mat4 } from '../../Math/TSM_Library/mat4';
import { ITransformable } from './ITransformable';
import { vec3 } from "../../Math/TSM_Library/vec3";

    abstract class MeshTracker{
        
        public Index         : number ;
        public MaterialIndex : number ;
        public name          : string;

    }
    export class GLMesh extends MeshTracker implements ITransformable{

        private _bufferNames : string[] = [];
        private _buffers :  {[name:string]:GLBuffer } = {}

        private transformLocation : WebGLUniformLocation = null;
        private transform: mat4 = mat4.getIdentity();
    
        public verticies    : number[];
        public texCoords    : number[];
        public faceIndecies : number[];

        public POSITION    : number; //mat.VERTEX_POSITION;
        public UV          : number;//mat.VERTEX_UV;
        public NORMAL      : number;//mat.VERTEX_NORMAL;
        
        public constructor(
            verticies    : number[]= null,
            texCoords    : number[]= null,
            faceIndecies : number[]= null,
            normals : number[]= null,

        ){
            super();
            this.verticies    = verticies    ;
            this.texCoords    = texCoords    ;
            this.faceIndecies = faceIndecies ;

            this._bufferNames.push("uv");
            this._buffers["uv"]   = new GLBuffer(2, gl.FLOAT, gl.ARRAY_BUFFER, gl.STATIC_DRAW);

            this._bufferNames.push("loc");
            this._buffers["loc"]  = new GLBuffer(3, gl.FLOAT, gl.ARRAY_BUFFER, gl.STATIC_DRAW);

            this._bufferNames.push("face");
            this._buffers["face"] = new GLBuffer(123, gl.UNSIGNED_SHORT, gl.ELEMENT_ARRAY_BUFFER, gl.TRIANGLES);
        }
        
        private hasLoadedShader = false;
        private AssignThisBuffer(name:string, data : number[] ,attrLocation : number , pointSize : number, offset:number){
            
            let attr = new AttributeInfo( attrLocation, pointSize, offset);
            AssignBuffer(this._buffers[name], data, attr)

            function AssignBuffer(buffer : GLBuffer, data : number[] , attr : AttributeInfo):void{
                buffer.bind();
                buffer.addAttribute(attr);
                buffer.pushData( data );
                buffer.upload();
                buffer.unbind();
            }
        }
        public loadShaderLocations( mat : Material ){

            this.hasLoadedShader = true;
            this.POSITION    = mat.VERTEX_POSITION;
            this.UV          = mat.VERTEX_UV;
            this.NORMAL      = mat.VERTEX_NORMAL;
         
            // ALL ATTRIBTES THAT HAS ATTRIBUTE DATA 
            this.AssignThisBuffer( "loc" , this.verticies , this.POSITION , 3 , 0 );
        
            this.AssignThisBuffer( "uv" , this.texCoords , this.UV , 2 , 0 );

            // FACE INDICIES DOESNOT HAVE ATTRIBUTE DATA .. WHO KNOWS WHY
            this._buffers["face"].bind();
            this._buffers["face"].pushData( this.faceIndecies );
            this._buffers["face"].upload();
            this._buffers["face"].unbind();

            // UNIFORMS 
            //this.transformLocation    = mat.LOCAL_VERT_TRANS;
           
        }

        public bind(){
            
            this._bufferNames.forEach(name => {
                if(name == "norm"){
                    this._buffers[name].bind(true);    
                }else{
                    this._buffers[name].bind();    
                }                                
            });

            gl.uniformMatrix4fv(   this.transformLocation   , false, this.transform.values  );
        }

        public draw(){
            if(this.hasLoadedShader)
                this._buffers["face"].draw();
        }
        
        public unbind(){
            this._bufferNames.forEach(name => {
                this._buffers[name].unbind();
            });
        }

        public static createTestMesh(): GLMesh{

            return new GLMesh(
                [
                    -4.0, -1.0, -1.0,
                     4.0, -1.0, -1.0,
                     4.0, -1.0, -21.0,
                    -4.0, -1.0, -21.0,
                ],[
                    -1.5, 0,       
                    2.5, 0.0,      
                    2.5, 10.0,     
                    -1.5, 10,
                ],[
                    0,  1,  2,
                    0,  2,  3,
                ]);
            
        }

        public changeTransform( NEWtransform : mat4){
            this.transform = NEWtransform;
        }


    }

