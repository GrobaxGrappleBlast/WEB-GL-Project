import { GLShader, DefaultShader } from '../GL/GLShader';
import { mat4 } from '../../Math/TSM_Library/mat4';
import { gl } from '../GL/webGlUtil';
import { GLTexture, LoadableTexture } from './GLTexture';

abstract class Material_01{

    public shader : GLShader;
    public Index : number;
    public _meshIndicees : number[] = [];
    public name():string{return this.shader._name}; 

    public constructor( name : string ){
        this.shader = new DefaultShader(name);
        this.VERTEX_POSITION    = this.shader.getAttributeLocation(     "a_position"    );
        this.VERTEX_UV          = this.shader.getAttributeLocation(     "a_texCord"     );
        this.VERTEX_NORMAL      = this.shader.getAttributeLocation(     "a_normal"      );

        
        this.UNIFORM_WORLD      = this.shader.getUniformLocation(       "worldMatrix"   );
        this.UNIFORM_CAMERA     = this.shader.getUniformLocation(       "viewMatrix"    );
        this.UNIFORM_PROJECTION = this.shader.getUniformLocation(       "projMatrix"    );
        this.LOCAL_VERT_TRANS   = this.shader.getUniformLocation(       "Ltransform"    );
        
    }

    public VERTEX_POSITION  : number;
    public VERTEX_UV        : number;
    public VERTEX_NORMAL    : number;
 
    public LOCAL_VERT_TRANS  :WebGLUniformLocation;
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

    private _texture : {[index:number]:GLTexture} = {};
    private _texUnif : {[index:number]:WebGLUniformLocation} = {};
    private _texGLNI : {[index:number]:number} = {};
    private _texINDI : number[] = [];

    public constructor( name : string ){
        super(name);
    }

    public addTexture( tex : GLTexture, texUniform : WebGLUniformLocation, TextureNumber : number, GL_UNIF_NAME : string, TEX_GL_INDEX : number){
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
export class GLMaterial extends Material_02{
    
    private _texBase : GLTexture;
    private _texEmit : GLTexture;
    private _texRoug : GLTexture;
    public constructor(
        name :string,
        texBase : GLTexture = null,
        texEmit : GLTexture = null,
        texRoug : GLTexture = null,    
    ){
        super(name);
        //this._texBase = texBase; 
        //this._texEmit = texEmit; 
        //this._texRoug = texRoug; 

        this._texBase =  new LoadableTexture("resources\\3d\\broken_steampunk_clock\\textures\\Material_3_baseColor.png");
        this._texEmit =  new LoadableTexture("resources\\3d\\broken_steampunk_clock\\textures\\Material_3_emissive.png" );
        this._texRoug =  new LoadableTexture("resources\\3d\\broken_steampunk_clock\\textures\\Material_3_baseColor.png");


        this.texInit(this._texBase, "base", 0 ,gl.TEXTURE0);
        this.texInit(this._texEmit, "emit", 1 ,gl.TEXTURE1);
        this.texInit(this._texRoug, "rough",2 ,gl.TEXTURE2);

    }
    private texInit( tex : GLTexture, GL_UNIF_NAME : string , TextureNumber : number , TEX_GL_INDEX : number ):void{
        if(tex != null){
            var texUniform = this.shader.getUniformLocation(GL_UNIF_NAME);
            this.addTexture(tex,texUniform,TextureNumber,GL_UNIF_NAME,TEX_GL_INDEX);
        }
    }
}