import { AssetManager } from "./Loader/Assets/AssetManager";
import { FileRequest } from "./Loader/FileReuqest";
import { IFileRequestResponse } from "./Loader/IFileRequestResponse";
import { toRadians } from "./Math/TSM_Library/constants";
import { mat4 } from "./Math/TSM_Library/mat4";
import { vec3 } from "./Math/TSM_Library/vec3";

    export class testClass implements IFileRequestResponse{

        public _canvasid : string = "c"
        public gl: WebGLRenderingContext;
        public program;

        public _camPos = new vec3([-5,0,0]);
        public _lookAt = new vec3([ 0,0,0]);
        public _zDirection =new vec3([0,1,0]);

        public worldMatrix: mat4; 
        public viewMatrix : mat4;
        public projMatrix : mat4;

        public matWorldUniformLocation ;
        public matViewUniformLocation  ;
        public matProjUniformLocation  ;

        public boxTexture;
        public boxIndices;
        public canvas;
        public angle : number = 0.01;

        public vertexShaderText : string =`
        precision mediump float;
        
        attribute vec3 vertPosition;
        attribute vec2 vertTexCoord;
        varying vec2 fragTexCoord;
        uniform mat4 mWorld;
        uniform mat4 mView;
        uniform mat4 mProj;
        
        void main()
        {
          fragTexCoord = vertTexCoord;
          gl_Position = mProj * mView * mWorld * vec4(vertPosition, 1.0);
        } `;
        
        public fragmentShaderText: string =`
        precision mediump float;
    
        varying vec2 fragTexCoord;
        uniform sampler2D sampler;
    
        void main()
        {
          gl_FragColor = texture2D(sampler, fragTexCoord);
        }`;



        private image : any;
        private imageLoader : FileRequest;
        public constructor(){
            this.image = new Uint8Array([255,255,255,255]);
            this.imageLoader = new FileRequest( "resources/images/RTS_Crate.jpg",this);
        }

        public onFileRecieved( asset : any){
            this.image = AssetManager.getAsset("resources/images/RTS_Crate.jpg").data;
            this.image = asset.data;
            this.setupTextures(true);
        }


        public InitDemo():void {
            this.setupCanvas();
            this.setupShader();
            this.setupMESH();
            this.setupTextures(); 
            this.setupWOrld();
        }
        
        private setupCanvas():void{
            
            this.canvas = document.getElementById("c") as HTMLCanvasElement;
            this.canvas.width = 800;
            this.canvas.height=800;
            this.gl = this.canvas.getContext("webgl");

            if (!this.gl) {
                console.log('WebGL not supported, falling back on experimental-webgl');
                this.gl = this.canvas.getContext('experimental-webgl') as WebGLRenderingContext;
            }

            if (!this.gl) {
                alert('Your browser does not support WebGL');
            }

            this.gl.clearColor(0.75, 0.85, 0.8, 1.0);
            this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
            this.gl.enable(this.gl.DEPTH_TEST);
            this.gl.enable(this.gl.CULL_FACE);
            this.gl.frontFace(this.gl.CCW);
            this.gl.cullFace(this.gl.BACK);
            
        }
        private setupShader():void{

            //
            // Create shaders
            // 
            var vertexShader = this.gl.createShader(this.gl.VERTEX_SHADER);
            var fragmentShader = this.gl.createShader(this.gl.FRAGMENT_SHADER);

            this.gl.shaderSource(vertexShader, this.vertexShaderText);
            this.gl.shaderSource(fragmentShader, this.fragmentShaderText);

            this.gl.compileShader(vertexShader);
            if (!this.gl.getShaderParameter(vertexShader, this.gl.COMPILE_STATUS)) {
                console.error(  'ERROR compiling vertex shader!', this.gl.getShaderInfoLog(vertexShader)  );
                return;
            }

            this.gl.compileShader(fragmentShader);
            if (!this.gl.getShaderParameter(fragmentShader, this.gl.COMPILE_STATUS)) {
                console.error('ERROR compiling fragment shader!', this.gl.getShaderInfoLog(fragmentShader));
                return;
            }

            this.program = this.gl.createProgram();
            this.gl.attachShader(this.program , vertexShader);
            this.gl.attachShader(this.program , fragmentShader);
            this.gl.linkProgram(this.program );
            if (!this.gl.getProgramParameter(this.program , this.gl.LINK_STATUS)) {
                console.error('ERROR linking program!', this.gl.getProgramInfoLog(this.program ));
                return;
            }
            this.gl.validateProgram(this.program );
            if (!this.gl.getProgramParameter(this.program , this.gl.VALIDATE_STATUS)) {
                console.error('ERROR validating program!', this.gl.getProgramInfoLog(this.program ));
                return;
            }
            

        }
        private setupMESH():void{
            var boxVertices = 
            [ // X, Y, Z           U, V
                // Top
                -1.0, 1.0, -1.0,   0, 0,
                -1.0, 1.0, 1.0,    0, 1,
                1.0, 1.0, 1.0,     1, 1,
                1.0, 1.0, -1.0,    1, 0,

                // Left
                -1.0, 1.0, 1.0,    0, 0,
                -1.0, -1.0, 1.0,   1, 0,
                -1.0, -1.0, -1.0,  1, 1,
                -1.0, 1.0, -1.0,   0, 1,

                // Right
                1.0, 1.0, 1.0,    1, 1,
                1.0, -1.0, 1.0,   0, 1,
                1.0, -1.0, -1.0,  0, 0,
                1.0, 1.0, -1.0,   1, 0,

                // Front
                1.0, 1.0, 1.0,    1, 1,
                1.0, -1.0, 1.0,    1, 0,
                -1.0, -1.0, 1.0,    0, 0,
                -1.0, 1.0, 1.0,    0, 1,

                // Back
                1.0, 1.0, -1.0,    0, 0,
                1.0, -1.0, -1.0,    0, 1,
                -1.0, -1.0, -1.0,    1, 1,
                -1.0, 1.0, -1.0,    1, 0,

                // Bottom
                -1.0, -1.0, -1.0,   1, 1,
                -1.0, -1.0, 1.0,    1, 0,
                1.0, -1.0, 1.0,     0, 0,
                1.0, -1.0, -1.0,    0, 1,
            ];

            this.boxIndices =
            [
                // Top
                0, 1, 2,
                0, 2, 3,

                // Left
                5, 4, 6,
                6, 4, 7,

                // Right
                8, 9, 10,
                8, 10, 11,

                // Front
                13, 12, 14,
                15, 14, 12,

                // Back
                16, 17, 18,
                16, 18, 19,

                // Bottom
                21, 20, 22,
                22, 20, 23
            ];

            var boxVertexBufferObject = this.gl.createBuffer();
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, boxVertexBufferObject);
            this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(boxVertices), this.gl.STATIC_DRAW);

            var boxIndexBufferObject = this.gl.createBuffer();
            this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, boxIndexBufferObject);
            this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.boxIndices), this.gl.STATIC_DRAW);

            var positionAttribLocation = this.gl.getAttribLocation(this.program , 'vertPosition');
            var texCoordAttribLocation = this.gl.getAttribLocation(this.program , 'vertTexCoord');
            this.gl.vertexAttribPointer(
                positionAttribLocation, // Attribute location
                3, // Number of elements per attribute
                this.gl.FLOAT, // Type of elements
                false,
                5 * Float32Array.BYTES_PER_ELEMENT, // Size of an individual vertex
                0 // Offset from the beginning of a single vertex to this attribute
            );
            this.gl.vertexAttribPointer(
                texCoordAttribLocation, // Attribute location
                2, // Number of elements per attribute
                this.gl.FLOAT, // Type of elements
                false,
                5 * Float32Array.BYTES_PER_ELEMENT, // Size of an individual vertex
                3 * Float32Array.BYTES_PER_ELEMENT // Offset from the beginning of a single vertex to this attribute
            );

            this.gl.enableVertexAttribArray(positionAttribLocation);
            this.gl.enableVertexAttribArray(texCoordAttribLocation);

        }
        private setupTextures(hasLoaded : boolean = false ):void{
            this.boxTexture = this.gl.createTexture();
            this.gl.bindTexture(this.gl.TEXTURE_2D, this.boxTexture);
            this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
            this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
            this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
            this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
            if(hasLoaded){
                var LOOKATME = this.image;
                this.gl.texImage2D(
                    this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA,
                    this.gl.UNSIGNED_BYTE,
                    this.image
                );
            }else{
                this.gl.texImage2D( 
                this.gl.TEXTURE_2D,
                0, 
                this.gl.RGBA,
                1,
                1,
                0,
                this.gl.RGBA, 
                this.gl.UNSIGNED_BYTE, 
                this.image
                );
            }
            this.gl.bindTexture(this.gl.TEXTURE_2D, null);
        }
        private setupWOrld():void{
            // Tell OpenGL state machine which program should be active.
            this.gl.useProgram(this.program);

            this.matWorldUniformLocation = this.gl.getUniformLocation(this.program, 'mWorld');
            this.matViewUniformLocation  = this.gl.getUniformLocation(this.program, 'mView');
            this.matProjUniformLocation  = this.gl.getUniformLocation(this.program, 'mProj');
            
            this.worldMatrix = mat4.getIdentity();
            this.viewMatrix  = mat4.lookAt( this._camPos, this._lookAt, this._zDirection);
            this.projMatrix  = mat4.perspective( toRadians(45), this.canvas.clientWidth / this.canvas.clientHeight, 0.1, 1000.0 );


            this.gl.uniformMatrix4fv(this.matWorldUniformLocation,false, this.worldMatrix.values);
            this.gl.uniformMatrix4fv(this.matViewUniformLocation, false, this.viewMatrix.values);
            this.gl.uniformMatrix4fv(this.matProjUniformLocation, false, this.projMatrix.values);
        }
        
       
        public update():void{

            this.worldMatrix = this.worldMatrix.rotate(this.angle, new vec3([0.5,0.5,1]) );
            
            
            this.gl.uniformMatrix4fv(this.matWorldUniformLocation, false, this.worldMatrix.values);

            this.gl.clearColor(0.75, 0.85, 0.8, 1.0);
            this.gl.clear(this.gl.DEPTH_BUFFER_BIT | this.gl.COLOR_BUFFER_BIT);

            this.gl.bindTexture(this.gl.TEXTURE_2D, this.boxTexture);
            this.gl.activeTexture(this.gl.TEXTURE0);

            this.gl.drawElements(this.gl.TRIANGLES, this.boxIndices.length, this.gl.UNSIGNED_SHORT, 0);

            //requestAnimationFrame(loop);
        };

    }
        
