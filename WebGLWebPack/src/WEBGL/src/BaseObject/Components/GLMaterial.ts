import { GLShader, DefaultShader, ShaderBackground, GlTexData, DefaultShadowShader } from '../GL/GLShader';
import { mat4 } from '../../Math/TSM_Library/mat4';
import { gl } from '../GL/webGlUtil';
import { GLTexture, LoadableTexture, CubeMapTexture, ITexture, GLShadowTexture } from './GLTexture';
import { HashArray } from '../HashArray';
import { vec3 } from '../../Math/TSM_Library/vec3';
import { Camera } from '../../Loader/Assets/Loaders/JSONAssetLoader';
import { CONTEXT } from '../../Context';



export class TextureDataInput{
    public role : string; 
    public request : string;
    public constructor(
        role    : string, 
        request : string
        ){  
            this.role = role    ;
            this.request  = request ;
        }
}

export abstract class GLAMaterial{

    public name         : string;
    public Index        : number;
    public shader       : number;

    public _meshIndicees: number[] = [];
    //public data         : HashArray<TextureData> = new HashArray<TextureData>();
    public textures     : GlTexData[] = [];
    public cubeTextures : GlTexData[] = [];

    public reflectionMatrix : mat4 = mat4.getIdentity();
    
    public constructor( name:string, textureRequests:TextureDataInput[], cubeTextureRequests:TextureDataInput[] , shader : string ){
        
        this.shader = CONTEXT.requestShader(shader);
        this.name = name; 
        
        var a = CONTEXT.SHADERS; 
        let data = CONTEXT.SHADERS.get(this.shader).ShaderTextureData;
        var curr :GlTexData;

        if(textureRequests != null )
        textureRequests.forEach( texture => {
            curr = data.getHash( texture.role );
            var texID : number = CONTEXT.requestTextureindex( texture.request );
            this.textures.push( new GlTexData( curr.role , curr.index, curr.GLTexNum, texID  ) );// texID , curr.index, curr.GLTexNum, 
        });

        if(cubeTextureRequests != null )
        cubeTextureRequests.forEach( texture => {
            curr =  data.getHash( texture.role );
            var texID : number = CONTEXT.requestCubeTextureindex( texture.request );
            this.cubeTextures.push(  new GlTexData( curr.role , curr.index, curr.GLTexNum, texID  ) );
        });
    }


    public bind(){

       
        gl.uniform3fv(
            CONTEXT.SHADERS.get(this.shader).getUniformLocation( "eyePosition" ),
            CONTEXT.ActiveCamera.position.xyz
        );
                
        gl.uniformMatrix4fv(
            CONTEXT.SHADERS.get(this.shader).getUniformLocation( "reflectionMatrix" ),
            false,
            this.reflectionMatrix.values
        );

       
    }
    public unBind(){
       // CONTEXT.unBindMaterial();
       // CONTEXT.unBindTextures();
    }
}



export class GLMaterial extends GLAMaterial{
    public constructor(
        name :string,
        textureRequests:TextureDataInput[] = null,
        squareTextureRequests:TextureDataInput[] = null
    ){
        // NOTE THAT squareTextureRequests Requires the SquareTextures to exist in the Context 
        super( name,textureRequests,squareTextureRequests, DefaultShadowShader.getType() );
    }
}

export class BackgroundMaterial extends GLAMaterial {
    public constructor(
        name :string,
        textureRequests:TextureDataInput[] = null,
        squareTextureRequests:TextureDataInput[] = null
    ){
        
        // NOTE THAT squareTextureRequests Requires the SquareTextures to exist in the Context 
        super(name,  textureRequests,squareTextureRequests, ShaderBackground.getType() );

        var rotation            = CONTEXT.ActiveCamera.getProjectionMatrix().copy().getRotationMATRIX();
        this.reflectionMatrix   = CONTEXT.ActiveCamera.getViewMatrix().copy().inverse();
        this.reflectionMatrix   = this.reflectionMatrix.multiply( rotation.inverse() );
    }
}
