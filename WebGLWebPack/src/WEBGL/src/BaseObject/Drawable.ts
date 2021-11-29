import { World } from "./../World/World";
import { Mesh } from "./Components/Mesh";
import { LoadableTexture, Texture } from "./Components/Texture";
import { DefaultShader, Shader } from "./GL/Shader";
import { gl } from "./GL/webGlUtil";
import { IDrawable } from './IDrawable';

    export class Drawable implements IDrawable{

        public _tex : Texture; 
        public _shader : Shader;
        public _mesh : Mesh;

        public constructor(){}
   
        public setupWOrld():void{
            this._shader.use();
            gl.uniformMatrix4fv(this._shader.getUniformLocation("worldMatrix"), false, World.getInstance().worldMatrix.values );
            gl.uniformMatrix4fv(this._shader.getUniformLocation("viewMatrix") , false, World.getInstance().viewMatrix.values  );
            gl.uniformMatrix4fv(this._shader.getUniformLocation("projMatrix") , false, World.getInstance().projMatrix.values  );
        }
        
        public bind(){
            this._shader.use();
            this._mesh.bind();
            this._tex.bind();
        }

        public draw(){
            this.bind();
            this._mesh.draw();
        }

    }

    export class DefaultCube extends Drawable{
        public constructor(){
            super();
            this._shader = new DefaultShader("SHADER01"); 
            this._mesh  = Mesh.createTestMesh();
            this._mesh.loadShaderLocations(this._shader);
            this._tex = new LoadableTexture("resources/images/RTS_Crate.png")
            this.setupWOrld();
        }
        
        public draw():void{
            World.getInstance().rotateWorld(0.01);
            gl.uniformMatrix4fv(this._shader.getUniformLocation("worldMatrix"), false,  World.getInstance().worldMatrix.values    );
            gl.clearColor(0.75, 0.85, 0.8, 1.0);
            gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);
            this.bind();
            super.draw();
        }
    }

    
  