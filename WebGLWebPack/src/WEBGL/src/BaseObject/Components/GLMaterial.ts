import { GLShader, DefaultShader, DefaultShader2 } from '../GL/GLShader';
import { mat4 } from '../../Math/TSM_Library/mat4';
import { gl } from '../GL/webGlUtil';
import { GLTexture, LoadableTexture, CubeMapTexture, ITexture } from './GLTexture';
import { HashArray } from '../HashArray';



export abstract class Material{

    public shader : GLShader;
    public Index : number;
    public _meshIndicees : number[] = [];
    public name():string{return this.shader._name}; 

    public constructor( shader : GLShader ){
        this.shader = shader;
        this.VERTEX_POSITION    = this.shader.getAttributeLocation(     "a_position"    );
        this.VERTEX_UV          = this.shader.getAttributeLocation(     "a_texCord"    );
        this.VERTEX_NORMAL      = this.shader.getAttributeLocation(     "a_normal"    );

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

    public abstract bind();
    public abstract updateOther(val:number);
    public abstract updateFilter(val:number);
}

export class TextureData{

    public uniform      : WebGLUniformLocation   ;
    public textureNum   : number                 ;
    public Texture      : ITexture               ;     
    public GL_TEXTURELOC: number                 ;
    
    public constructor(
        
        uniform : WebGLUniformLocation ,
        textureNum  : number, 
        Texture : ITexture  ,
        GL_TEXTURELOC: number  
        ){
            this.uniform    = uniform     ; 
            this.textureNum = textureNum  ; 
            this.Texture= Texture; 
            this.GL_TEXTURELOC =  GL_TEXTURELOC;
        }

}
export abstract class Material_02 extends Material{

    public data     : HashArray<TextureData> = new HashArray<TextureData>();
 
    public constructor( name : string ){
        super( new DefaultShader(name) );   
    }

    public use():void{
        this.shader.use();
    }

    public bind():void{
        console.log("ASDASDAD");
        this.data.forEach( (data,i) => {
            gl.uniform1i(data.uniform , data.textureNum );
            data.Texture.bind( data.GL_TEXTURELOC );
        });
    }

    public updateOther(val:number){}
    public updateFilter(val:number){}
}
export class GLMaterial extends Material_02{
    
    //private data     : HashArray<TextureData> = new HashArray<TextureData>();

    private _texBase : GLTexture;
    private _texEmit : GLTexture;
    private _texRoug : GLTexture;
    public constructor(
        name :string,
        texBase : GLTexture = null,
        texEmit : GLTexture = null,
        texRoug : GLTexture = null,    
    ){
        super("GLMaterials");
        //this._texBase = texBase; 
        //this._texEmit = texEmit; 
        //this._texRoug = texRoug; 

        this._texBase =  GLTexture.createCheckers(8);
        //this._texEmit =  new LoadableTexture("resources\\3d\\broken_steampunk_clock\\textures\\Material_3_emissive.png" );
        //this._texRoug =  new LoadableTexture("resources\\3d\\broken_steampunk_clock\\textures\\Material_3_baseColor.png");

        //this.texInit(this._texBase, "base", 0 ,gl.TEXTURE0);
        //this.texInit(this._texEmit, "emit", 1 ,gl.TEXTURE1);
        //this.texInit(this._texRoug, "rough",2 ,gl.TEXTURE2);
        this.data.add(
            new TextureData( 
                this.shader.getUniformLocation("base"),0,
                GLTexture.createCheckers(8),gl.TEXTURE0
                ),
            "base"
        )

        this.data.add( 
            new TextureData( 
            this.shader.getUniformLocation("cubeTexture"),1,
            new CubeMapTexture,gl.TEXTURE1 ),"cubeTexture"
        );
    }


}


export class CubeMaterial extends Material {//extends Material_01{

    private texture  : WebGLTexture;
    private _texBase : CubeMapTexture;
    private data     : HashArray<TextureData> = new HashArray<TextureData>();

    public constructor(
        name :string
    ){
        super( new DefaultShader2(name) );
        this._texBase = new CubeMapTexture();
        this.texInit();

        this.data.add( 
            new TextureData( 
                this.shader.getUniformLocation("u_texture"), 
                gl.TEXTURE0 ,
                new CubeMapTexture,
                0
            ),
            "u_texture"
        );
    }

    private texInit(){
        this.bind();
    }

    public override bind():void{
        
        this.data.forEach( (data,i) => {
            gl.uniform1i(data.uniform , i);
            data.Texture.bind(0);
        });

    }

    public updateOther(val:number){
        this.data.forEach( (data,i) => {
            gl.uniform1i(data.uniform , i);
            data.Texture.bind(0);
        });
    }

    public updateFilter(val:number){
        this.data.forEach( (data,i) => {
            gl.uniform1i(data.uniform , i);
            data.Texture.bind(0);
        });
    }
}
