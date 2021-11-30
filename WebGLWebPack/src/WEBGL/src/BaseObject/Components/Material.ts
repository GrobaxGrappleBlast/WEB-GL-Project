import { Shader, DefaultShader } from '../GL/Shader';
import { vec3 } from '../../Math/TSM_Library/vec3';
import { vec2 } from '../../Math/TSM_Library/vec2';
import { mat4 } from '../../Math/TSM_Library/mat4';
import { gl } from '../GL/webGlUtil';
import { Texture } from './Texture';

abstract class Material_01{

    public shader : Shader;
    public constructor( name : string ){
        this.shader = new DefaultShader(name);

        this.VERTEX_POSITION    = this.shader.getAttributeLocation(     "a_position"    );
        this.VERTEX_UV          = this.shader.getAttributeLocation(     "a_texCord"     );
        this.VERTEX_NORMAL      = this.shader.getAttributeLocation(     "a_normal"      );

        this.UNIFORM_WORLD      = this.shader.getUniformLocation(       "worldMatrix"   );
        this.UNIFORM_CAMERA     = this.shader.getUniformLocation(       "viewMatrix"    );
        this.UNIFORM_PROJECTION = this.shader.getUniformLocation(       "projMatrix"    );
    }

    public VERTEX_POSITION  : number;
    public VERTEX_UV        : number;
    public VERTEX_NORMAL    : number;

    public UNIFORM_WORLD     :WebGLUniformLocation;   
    public UNIFORM_CAMERA    :WebGLUniformLocation;
    public UNIFORM_PROJECTION:WebGLUniformLocation;

    
    public updateUniform_World(matrix : mat4){
        gl.uniformMatrix4fv(this.UNIFORM_WORLD      , false, matrix.values );
    }
    
    public updateUniform_Camera(matrix : mat4){
        gl.uniformMatrix4fv(this.UNIFORM_CAMERA     , false, matrix.values  );
    }
    
    public updateUniform_Projection(matrix : mat4){
        gl.uniformMatrix4fv(this.UNIFORM_PROJECTION , false, matrix.values  );
    }

    public use():void{
        this.shader.use();
    }

}
abstract class Material_02 extends Material_01{

    private _texture : {[index:number]:Texture} = {};
    private _texUnif : {[index:number]:WebGLUniformLocation} = {};
    private _texGLNI : {[index:number]:number} = {};
    private _texINDI : number[] = [];

    public constructor( name : string ){
        super(name);
    }

    public addTexture( tex : Texture, texUniform : WebGLUniformLocation, TextureNumber : number, GL_UNIF_NAME : string, TEX_GL_INDEX : number){
        this._texINDI.push(TextureNumber);
        this._texUnif[  TextureNumber   ] = texUniform;
        this._texture[  TextureNumber   ] = tex ;
        this._texGLNI[  TextureNumber   ] = TEX_GL_INDEX;
    }   

    public use():void{
        this.shader.use();
    }


    public bind():void{
        this._texINDI.forEach( texID  => {
            gl.uniform1i(this._texUnif[texID], texID);
        });

        this._texINDI.forEach( texID  => {
           this._texture[texID].bind(this._texGLNI[texID]);
        });
    }
}
export class Material extends Material_02{
    
    private _texBase : Texture;
    private _texEmit : Texture;
    private _texRoug : Texture;
    public constructor(
        name :string,
        texBase : Texture = null,
        texEmit : Texture = null,
        texRoug : Texture = null,    
    ){
        super(name);
        this._texBase = texBase; 
        this._texEmit = texEmit; 
        this._texRoug = texRoug; 

        this.texInit(this._texBase, "base", 0 ,gl.TEXTURE0);
        this.texInit(this._texEmit, "emit", 1 ,gl.TEXTURE1);
        this.texInit(this._texRoug, "rough",2 ,gl.TEXTURE2);

    }
    private texInit( tex : Texture, GL_UNIF_NAME : string , TextureNumber : number , TEX_GL_INDEX : number ):void{
        if(tex != null){
            var texUniform = this.shader.getUniformLocation(GL_UNIF_NAME);
            this.addTexture(tex,texUniform,TextureNumber,GL_UNIF_NAME,TEX_GL_INDEX);
        }
    }
}