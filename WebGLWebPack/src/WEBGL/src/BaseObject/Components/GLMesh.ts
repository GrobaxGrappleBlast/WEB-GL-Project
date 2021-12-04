import { AttributeInfo } from "../GL/GLBuffer";
import { gl } from "../GL/webGlUtil";
import { GLBuffer } from "../GL/GLBuffer"
import { GLMaterial } from './GLMaterial';


    abstract class MeshTracker{
        
        public Index         : number ;
        public MaterialIndex : number ;
        public name          : string;

    }
    export class GLMesh extends MeshTracker{

        private _bufferNames : string[] = [];
        private _buffers :  {[name:string]:GLBuffer } = {}

        public verticies    : number[];
        public texCoords    : number[];
        public faceIndecies : number[];
        public normals : number[];

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
            this.normals      = normals      ;

            this._bufferNames.push("uv");
            this._buffers["uv"]   = new GLBuffer(2, gl.FLOAT, gl.ARRAY_BUFFER, gl.STATIC_DRAW);

            this._bufferNames.push("loc");
            this._buffers["loc"]  = new GLBuffer(3, gl.FLOAT, gl.ARRAY_BUFFER, gl.STATIC_DRAW);

            this._bufferNames.push("norm");
            this._buffers["norm"] = new GLBuffer(3, gl.FLOAT, gl.ARRAY_BUFFER, gl.STATIC_DRAW);

            this._bufferNames.push("face");
            this._buffers["face"] = new GLBuffer(123, gl.UNSIGNED_SHORT, gl.ELEMENT_ARRAY_BUFFER, gl.TRIANGLES);
        }
        
        private hasLoadedShader = false;
        public loadShaderLocations( mat :GLMaterial ){

            this.hasLoadedShader = true;
            var POSITION    = mat.VERTEX_POSITION;
            var UV          = mat.VERTEX_UV;
            var NORMAL      = mat.VERTEX_NORMAL;

            function AssignThisBuffer(name:string, data : number[] ,attrLocation : number , pointSize : number, offset:number, THIS : GLMesh ){
            
                let attr = new AttributeInfo( attrLocation, pointSize, offset);
                AssignBuffer(THIS._buffers[name], data, attr)

                function AssignBuffer(buffer : GLBuffer, data : number[] , attr : AttributeInfo):void{
                    buffer.bind();
                    buffer.addAttribute(attr);
                    buffer.pushData( data );
                    buffer.upload();
                    buffer.unbind();
                }
            }
         
            // ALL ATTRIBTES THAT HAS ATTRIBUTE DATA 
            AssignThisBuffer( "loc" , this.verticies , POSITION , 3 , 0 , this);
        
            AssignThisBuffer( "uv" , this.texCoords , UV , 2 , 0 ,this);

            if(this.normals != null )
                AssignThisBuffer( "norm", this.normals, NORMAL, 3 ,0,this)

            // FACE INDICIES DOESNOT HAVE ATTRIBUTE DATA .. WHO KNOWS WHY
            this._buffers["face"].bind();
            this._buffers["face"].pushData( this.faceIndecies );
            this._buffers["face"].upload();
            this._buffers["face"].unbind();
        }


        
        public bind(){
            this._bufferNames.forEach(name => {
                if(name == "norm"){
                    this._buffers[name].bind(true);    
                }else{
                    this._buffers[name].bind();    
                }                                
            });
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
                    -1.0,  1.0, -1.0,        -1.0,  1.0,  1.0,        1.0,  1.0,  1.0,        1.0,  1.0, -1.0,
                    -1.0,  1.0,  1.0,        -1.0, -1.0,  1.0,       -1.0, -1.0, -1.0,       -1.0,  1.0, -1.0,
                     1.0,  1.0,  1.0,         1.0, -1.0,  1.0,        1.0, -1.0, -1.0,        1.0,  1.0, -1.0,
                     1.0,  1.0,  1.0,         1.0, -1.0,  1.0,       -1.0, -1.0,  1.0,       -1.0,  1.0,  1.0,
                     1.0,  1.0, -1.0,         1.0, -1.0, -1.0,       -1.0, -1.0, -1.0,       -1.0,  1.0, -1.0,
                    -1.0, -1.0, -1.0,        -1.0, -1.0,  1.0,        1.0, -1.0,  1.0,        1.0, -1.0, -1.0
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
                ]/*,[
                     0.5,  0.5,  0.5,    0.5,  0.5,  0.5,    0.5,  0.5,  0.5,    0.5,  0.5,  0.5,  
                     0.75, 0.25, 0.5,    0.75, 0.25, 0.5,    0.75, 0.25, 0.5,    0.75, 0.25, 0.5,
                     0.25, 0.25, 0.75,   0.25, 0.25, 0.75,   0.25, 0.25, 0.75,   0.25, 0.25, 0.75,
                     0.0,  0.0,  0.15,   1.0,  0.0,  0.15,   1.0,  0.0,  0.15,   1.0,  0.0,  0.15, 
                     0.0,  1.0,  0.15,   0.0,  1.0,  0.15,   0.0,  1.0,  0.15,   0.0,  1.0,  0.15,
                     0.5,  0.5,  1.0,    0.5,  0.5,  1.0,    0.5,  0.5,  1.0,    0.5,  0.5,  1.0
                ]*/);
            
        }



    }

