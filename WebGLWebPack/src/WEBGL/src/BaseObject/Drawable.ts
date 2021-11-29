import { GLOBAL_WORLD, World } from "./../World/World";
import { Mesh } from "./Components/Mesh";
import { LoadableTexture, Texture } from "./Components/Texture";
import { DefaultShader, Shader } from "./GL/Shader";
import { gl } from "./GL/webGlUtil";
import { IDrawable } from './IDrawable';

    export class Drawable implements IDrawable{
        private _mesh : Mesh;

        public constructor(){}
   
        public bind(){
            this._mesh.bind();
            
        }

        public draw(){
            this.bind();
            this._mesh.draw();
        }

        public getMesh():Mesh{
            return this._mesh;
        }
        public setMesh(nMesh : Mesh, shader:Shader):void{
            this._mesh = nMesh;
            this._mesh.loadShaderLocations(shader);
        }

    }

    export class DefaultCube extends Drawable{
        public constructor(shader : Shader){
            super();
            this.setMesh(Mesh.createTestMesh(),shader);
            
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

    
  