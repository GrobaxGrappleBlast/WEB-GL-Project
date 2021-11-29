import { AttributeInfo } from "../GL/Buffer";
import { Shader } from "../GL/Shader";
import { gl } from "../GL/webGlUtil";
import { Buffer } from "../GL/Buffer"

    
    export class Mesh {

        private _bufferNames : string[] = [];
        private _buffers :  {[name:string]:Buffer } = {}

        public verticies    : number[];
        public texCoords    : number[];
        public faceIndecies : number[];

        public constructor(
            verticies    : number[]= null,
            texCoords    : number[]= null,
            faceIndecies : number[]= null,
        ){
            this.verticies    = verticies    ;
            this.texCoords    = texCoords    ;
            this.faceIndecies = faceIndecies ;

            this._bufferNames.push("uv");
            this._buffers["uv"] = new Buffer(2, gl.FLOAT, gl.ARRAY_BUFFER, gl.STATIC_DRAW);

            this._bufferNames.push("loc");
            this._buffers["loc"] = new Buffer(3, gl.FLOAT, gl.ARRAY_BUFFER, gl.STATIC_DRAW);

            this._bufferNames.push("face");
            this._buffers["face"] = new Buffer(123, gl.UNSIGNED_SHORT, gl.ELEMENT_ARRAY_BUFFER, gl.TRIANGLES);
        }
        
        private hasLoadedShader = false;
        public loadShaderLocations( shader : Shader ){

            this.hasLoadedShader = true;
            var _location_vertLocation = shader.getAttributeLocation("a_position") ;
            var _location_vertUVCoord  = shader.getAttributeLocation("a_texCord") ;

            function AssignBuffer(buffer : Buffer, data : number[] , attr : AttributeInfo):void{

                buffer.bind();
                buffer.addAttribute(attr);
                buffer.pushData( data );
                buffer.upload();
                buffer.unbind();
            }
            let attr; 

            // ALL ATTRIBTES THAT HAS ATTRIBUTE DATA 
            attr = new AttributeInfo( _location_vertLocation, 3, 0);
            AssignBuffer(this._buffers["loc"], this.verticies, attr)
        
            attr = new AttributeInfo( _location_vertUVCoord, 2, 0);
            AssignBuffer(this._buffers["uv"], this.texCoords, attr)
            
            // FACE INDICIES DOESNOT HAVE ATTRIBUTE DATA .. WHO KNOWS WHY
            this._buffers["face"].bind();
            this._buffers["face"].pushData( this.faceIndecies );
            this._buffers["face"].upload();
            this._buffers["face"].unbind();
        }


        
        public bind(){
            this._bufferNames.forEach(name => {
                    this._buffers[name].bind(false,name);                
            });
        }

        public draw(){
            if(this.hasLoadedShader){
                this._buffers["face"].draw();
            }else{
                console.log("TRIED TO DRAW MESH BEFORE SHADER WAS LOADED TO MESH");
            }
        }
        
        public unbind(){
            this._bufferNames.forEach(name => {
                this._buffers[name].unbind();
            });
        }

        public static createTestMesh(): Mesh{

            return new Mesh(
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

