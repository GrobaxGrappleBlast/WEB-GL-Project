import { GLShader, DefaultShader, ShaderBackground, GlTexData } from '../GL/GLShader';
import { mat4 } from '../../Math/TSM_Library/mat4';
import { gl } from '../GL/webGlUtil';
import { GLTexture, LoadableTexture, CubeMapTexture, ITexture, WhiteSTDTexture } from './GLTexture';
import { HashArray } from '../HashArray';
import { GLOBAL_WORLD } from '../../World/World';
import { vec3 } from '../../Math/TSM_Library/vec3';



export abstract class Material{

    public shader : GLShader;
    public Index : number;
    public _meshIndicees : number[] = [];
    //public name():string{return this.shader._name}; 
    public name :string;

    public constructor( name:string,shader : GLShader ){
        this.shader = shader;
        this.name = name;
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
    
    public static CreateShader(name:string): GLShader{
        return  new DefaultShader(name);
    }

    public abstract bind();
    public abstract unBind();
    public abstract updateOther(val:number);
    public abstract updateFilter(val:number);
}

export class TextureDataInput{
    public role : string; 
    public texture : ITexture;
    public constructor(
        role    : string, 
        texture : ITexture
        ){  
            this.role    =role    ;
            this.texture =texture ;
        }
}
class TextureData{

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
abstract class Material_02 extends Material{

    public data     : HashArray<TextureData> = new HashArray<TextureData>();
    public reflectionMatrix : mat4 = mat4.getIdentity();
    

    public constructor( name:string,shader : GLShader ){
        super( name,shader );       
    }

    public use():void{
        
        if( false ){ //!this.shader.isInUse()){

            gl.uniform3fv(
                this.shader.getUniformLocation( "eyePosition" ),
                GLOBAL_WORLD.camPos.xyz
            );
                    
            gl.uniformMatrix4fv(
                this.shader.getUniformLocation( "reflectionMatrix" ),
                false,
                this.reflectionMatrix.values
            );

        }

        this.shader.use();

    }

    public override bind():void{

        gl.uniform3fv(
            this.shader.getUniformLocation( "eyePosition" ),
            GLOBAL_WORLD.camPos.xyz
        );
                
        gl.uniformMatrix4fv(
            this.shader.getUniformLocation( "reflectionMatrix" ),
            false,
            this.reflectionMatrix.values
        );
        
        this.data.forEach( (data,i) => {
            gl.uniform1i(data.uniform , data.textureNum );
            data.Texture.bind( data.GL_TEXTURELOC );
        });
    }
    public override unBind(){
        this.data.forEach( (data,i) => {
            gl.uniform1i(data.uniform , null );
            data.Texture.unBind();
        });
    }

    public updateOther(val:number){}
    public updateFilter(val:number){}
}

class Material_03 extends Material_02{
    
    

    public constructor(
        name :string,
        texturesIN : TextureDataInput[],
        shader : GLShader
    ){  
        super(name,shader);

        // TODO provide UINT Texture for all unprovided textures 
        var roleList : HashArray<boolean> = new HashArray<boolean>();

        // SETUP TEXTURES FOR EVERY TEXTURE YOU HAVE RECIEVED;
        texturesIN.forEach( texture => {
            var data = this.shader.ShaderTextureData.getHash(texture.role);
            roleList.add(true,texture.role);
            this.data.add(
                new TextureData( 
                    this.shader.getUniformLocation( data.role ),data.index,
                    texture.texture , data.GLTexNum
                    ),
                data.role
            )    
        });
        
        var texList = this.shader.ShaderTextureData.getKeys();
        texList.forEach( textureRole => {
            if( ! roleList.hasIndex(textureRole) ){

                var data = this.shader.ShaderTextureData.getHash(textureRole);
                roleList.add(true,textureRole);
                this.data.add(
                    new TextureData( 
                        this.shader.getUniformLocation( data.role ),data.index,
                        new WhiteSTDTexture() , data.GLTexNum
                        ),
                    data.role
                )    

            }
        });



    }
}

export class GLMaterial extends Material_03{
    public constructor(
        name :string,
        texturesIN : TextureDataInput[],
    ){
        super( name, texturesIN, new DefaultShader(name) );
    }
}

export class BackgroundMaterial extends Material_03 {//extends Material_01{

    
    public reflectionMatrix:mat4;
    
    public constructor(
        name :string,
        texturesIN : TextureDataInput[],
    ){
        super("BackGMAT_"+name, texturesIN, new ShaderBackground("BackGMAT_"+name) );

        var rotation = GLOBAL_WORLD.getProjectionMatrix().copy().getRotationMATRIX();
        this.reflectionMatrix = GLOBAL_WORLD.getViewMatrix().copy().inverse();
        this.reflectionMatrix = this.reflectionMatrix.multiply( rotation.inverse() );
    }

}
