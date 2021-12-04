import { GLOBAL_WORLD, World } from "./../World/World";
import { GLMesh } from "./Components/GLMesh";
import { LoadableTexture, GLTexture } from "./Components/GLTexture";
import { DefaultShader, GLShader } from "./GL/GLShader";
import { gl } from "./GL/webGlUtil";
import { IDrawable } from './IDrawable';
import { GLMaterial } from './Components/GLMaterial';
import { mat4 } from '../Math/TSM_Library/mat4';

    export class Drawable implements IDrawable{
        private _mesh : GLMesh;

        public constructor(){}
   
        public bind(){
            this._mesh.bind();
            
        }

        public draw(){
            this.bind();
            this._mesh.draw();
        }

        public getMesh():GLMesh{
            return this._mesh;
        }
        public setMesh(nMesh : GLMesh, shader: GLMaterial):void{
            this._mesh = nMesh;
            this._mesh.loadShaderLocations(shader);
        }

        public applyOffset( tranform : mat4 ){
            this._mesh.changeTransform(tranform);
        }


    }

    export class DefaultCube extends Drawable{
        public constructor(shader : GLMaterial){
            super();
            this.setMesh(GLMesh.createTestMesh(),shader);
            
        }
        
        public draw():void{
            //GLOBAL_WORLD.rotateWorld(0.01);
            //gl.uniformMatrix4fv(this._shader.getUniformLocation("worldMatrix"), false, GLOBAL_WORLD.worldMatrix.values    );
            //gl.clearColor(0.75, 0.85, 0.8, 1.0);
            //gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);
            this.bind();
            super.draw();
        }
    }

    
  