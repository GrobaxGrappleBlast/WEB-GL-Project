import { AssetManager } from "./Loader/Assets/AssetManager";
import { FileRequest } from "./Loader/FileReuqest";
import { IFileRequestResponse } from "./Loader/IFileRequestResponse";
import { toRadians } from "./Math/TSM_Library/constants";
import { mat4 } from "./Math/TSM_Library/mat4";
import { vec3 } from "./Math/TSM_Library/vec3";
import { gl } from './BaseObject/GL/webGlUtil';
import { GLShader, DefaultShader2 } from './BaseObject/GL/GLShader';
import { Vector2, Vector3 } from "three";

    export class testClass {


        private fieldOfViewRadians    = this.degToRad(60);
        private modelXRotationRadians = this.degToRad(0);
        private modelYRotationRadians = this.degToRad(0);

        
        private shader : DefaultShader2 = new DefaultShader2("shader");
        private positionLocation = this.shader.getAttributeLocation("a_position");
        private matrixLocation   = this.shader.getUniformLocation("u_matrix"); 
        private textureLocation  = this.shader.getUniformLocation("u_texture");
        private positionBuffer = gl.createBuffer();
        private then : number = 1;


        public camPos      = new vec3([8,25,-15]);
        public lookAt      = new vec3([ 0,-1,-12]);
        public zDirection  = new vec3([ 0,1,0]);

        public worldMatrix  : mat4 = mat4.getIdentity(); 
        public viewMatrix   : mat4 = mat4.lookAt( this.camPos, this.lookAt, this.zDirection);
        public projMatrix   : mat4 = mat4.perspective( toRadians(45), ( gl.canvas.width / gl.canvas.height), 0.1,1000 );



        public constructor(){
                // Bind it to ARRAY_BUFFER (think of it as ARRAY_BUFFER = positionBuffer)
                gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
                // Put the positions in the buffer
                this.setGeometry(gl);

                // Create a texture.
                var texture = gl.createTexture();
                gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);

                // Get A 2D context
                /** @type {Canvas2DRenderingContext} */
                const ctx = document.createElement("canvas").getContext("2d");

                ctx.canvas.width = 128;
                ctx.canvas.height = 128;

                const faceInfos = [
                    { target: gl.TEXTURE_CUBE_MAP_POSITIVE_X, faceColor: '#F00', textColor: '#0FF', text: '+X' },
                    { target: gl.TEXTURE_CUBE_MAP_NEGATIVE_X, faceColor: '#FF0', textColor: '#00F', text: '-X' },
                    { target: gl.TEXTURE_CUBE_MAP_POSITIVE_Y, faceColor: '#0F0', textColor: '#F0F', text: '+Y' },
                    { target: gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, faceColor: '#0FF', textColor: '#F00', text: '-Y' },
                    { target: gl.TEXTURE_CUBE_MAP_POSITIVE_Z, faceColor: '#00F', textColor: '#FF0', text: '+Z' },
                    { target: gl.TEXTURE_CUBE_MAP_NEGATIVE_Z, faceColor: '#F0F', textColor: '#0F0', text: '-Z' },
                ];
                faceInfos.forEach((faceInfo) => {
                    const {target, faceColor, textColor, text} = faceInfo;
                    this.generateFace(ctx, faceColor, textColor, text);

                    gl.texImage2D(target, 0,  gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, ctx.canvas);
                });
                gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
                gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);

                requestAnimationFrame( this.drawScene.bind(this) );

                // Draw the scene.
                
        }

        private generateFace(ctx, faceColor, textColor, text) {
            const {width, height} = ctx.canvas;
            ctx.fillStyle = faceColor;
            ctx.fillRect(0, 0, width, height);
            ctx.font = `${width * 0.7}px sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = textColor;
            //ctx.fillText(text, width / 2, height / 2);
        }
        // Fill the buffer with the values that define a cube.
        private setGeometry(gl) {
            var positions = new Float32Array(
                [
                -0.5, -0.5,  -0.5,
                -0.5,  0.5,  -0.5,
                0.5, -0.5,  -0.5,
                -0.5,  0.5,  -0.5,
                0.5,  0.5,  -0.5,
                0.5, -0.5,  -0.5,

                -0.5, -0.5,   0.5,
                0.5, -0.5,   0.5,
                -0.5,  0.5,   0.5,
                -0.5,  0.5,   0.5,
                0.5, -0.5,   0.5,
                0.5,  0.5,   0.5,

                -0.5,   0.5, -0.5,
                -0.5,   0.5,  0.5,
                0.5,   0.5, -0.5,
                -0.5,   0.5,  0.5,
                0.5,   0.5,  0.5,
                0.5,   0.5, -0.5,

                -0.5,  -0.5, -0.5,
                0.5,  -0.5, -0.5,
                -0.5,  -0.5,  0.5,
                -0.5,  -0.5,  0.5,
                0.5,  -0.5, -0.5,
                0.5,  -0.5,  0.5,

                -0.5,  -0.5, -0.5,
                -0.5,  -0.5,  0.5,
                -0.5,   0.5, -0.5,
                -0.5,  -0.5,  0.5,
                -0.5,   0.5,  0.5,
                -0.5,   0.5, -0.5,

                0.5,  -0.5, -0.5,
                0.5,   0.5, -0.5,
                0.5,  -0.5,  0.5,
                0.5,  -0.5,  0.5,
                0.5,   0.5, -0.5,
                0.5,   0.5,  0.5,

                ]);
            gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
        }

        private drawScene( time ) {
           
            // convert to seconds
            time *= 0.001;
            // Subtract the previous time from the current time
            if(this.then == undefined)
                this.then = 1; 

            var deltaTime = time - this.then;
            // Remember the current time for the next frame.
            this.then = time;
            
            gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

            gl.enable(gl.CULL_FACE);
            gl.enable(gl.DEPTH_TEST);

            // Animate the rotation
            this.modelYRotationRadians += -0.7 * deltaTime;
            this.modelXRotationRadians += -0.4 * deltaTime;

            // Clear the canvas AND the depth buffer.
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

            // Tell it to use our program (pair of shaders)
            this.shader.use();

            // Turn on the position attribute
            gl.enableVertexAttribArray(this.positionLocation);

            // Bind the position buffer.
            gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);

            // Tell the position attribute how to get data out of positionBuffer (ARRAY_BUFFER)
            var size = 3;          // 3 components per iteration
            var type = gl.FLOAT;   // the data is 32bit floats
            var normalize = false; // don't normalize the data
            var stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
            var offset = 0;        // start at the beginning of the buffer
            gl.vertexAttribPointer(
                this.positionLocation, size, type, normalize, stride, offset);

          
          
          
                // Compute the projection matrix
            var aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
            var projectionMatrix =
            mat4.perspective(this.fieldOfViewRadians, aspect, 1, 2000);

            var cameraPosition  = new vec3([0, 0, 2]);
            var up              = new vec3([0, 1, 0]);
            var target          = new vec3([0, 0, 0]);

            // Compute the camera's matrix using look at.
            var cameraMatrix = mat4.lookAt(cameraPosition, target, up);

            // Make a view matrix from the camera matrix.
            var viewMatrix = cameraMatrix.copy().inverse();

            var viewProjectionMatrix = projectionMatrix.multiply(viewMatrix);// mat4.multiply(projectionMatrix, viewMatrix);

            var matrix = viewProjectionMatrix.rotate( this.modelXRotationRadians, new vec3([ 1.0 , 0.0 , 0.0]) );// mat4.xRotate(viewProjectionMatrix, modelXRotationRadians);
                matrix = viewProjectionMatrix.rotate( this.modelYRotationRadians, new vec3([ 0.0 , 0.0 , 1.0]) ); //mat4.yRotate(matrix, modelYRotationRadians);



 

            // Set the matrix.
            gl.uniformMatrix4fv(this.matrixLocation, false, matrix.values);

            // Tell the shader to use texture unit 0 for u_texture
            gl.uniform1i(this.textureLocation, 0);

            // Draw the geometry.
            gl.drawArrays(gl.TRIANGLES, 0, 6 * 6);

            requestAnimationFrame( this.drawScene.bind(this) );
        }

        private radToDeg(r) {
            return r * 180 / Math.PI;
        }

        private degToRad(d) {
            return d * Math.PI / 180;
        }
    }
        
