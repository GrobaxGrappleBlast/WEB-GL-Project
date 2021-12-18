import { GLShader, ShaderBackground, DefaultShadowShader, DefaultShader, GlTexData } from './BaseObject/GL/GLShader';
import { GLMaterial, GLAMaterial, TextureDataInput } from './BaseObject/Components/GLMaterial';
import { GLShadowTexture, GLTexture, LoadableTexture, CubeMapTexture, COLORSTDTexture } from './BaseObject/Components/GLTexture';
import { GLMesh } from './BaseObject/Components/GLMesh';
import { AttributeInfo, GLBuffer } from './BaseObject/GL/GLBuffer';
import { gl } from './BaseObject/GL/webGlUtil';
import { GLCamera } from './BaseObject/Components/GLCamera';
import { World, AWorld } from './World/World';
import { HashArray } from './BaseObject/HashArray';
import { MeshStandardMaterial } from 'three';
import { ShadowMAPShader } from './BaseObject/Components/GLLight';



export var CONTEXT : Context;

export class Context{

    public constructor(){

        CONTEXT = this;
        
        this.MESHES     = new HashArray<GLMesh>     () ;
        this.MATERIALS  = new HashArray<GLAMaterial>() ;
        this.SHADERS    = new HashArray<GLShader>   () ;
        this.TEXTURES   = new HashArray<GLTexture>  () ;
        this.CUBETEXTURES = new HashArray<CubeMapTexture>();

        this._emptyTextureIndex = CONTEXT.registerTexture( new COLORSTDTexture(122,122,122) );
        this.initMeshBuffers();
        this.ActiveWorld = new AWorld();
        MESH_HANDLER_DELEGATE.initMeshBuffers();

    }

    public MESHES       : HashArray<GLMesh>      ;
    public MATERIALS    : HashArray<GLAMaterial> ;
    public SHADERS      : HashArray<GLShader>    ; //private ShaderIndice : {[name:string]:number} = {};

    public TEXTURES     : HashArray<GLTexture>   ; 
    public CUBETEXTURES : HashArray<CubeMapTexture>;
    public boundTextures:GlTexData[] = [];
    public readonly _emptyTextureIndex ;


    public currentShader    : GLShader;
    public currentMaterial  : number;

    public ShadowTexture    : GLShadowTexture;
    
    public ActiveCamera     : GLCamera;
    public ActiveWorld      : World;
    public FarPlaneCoordinate = 1000.0;


    // MESH RENDERING, 
    public _bufferNames      : string[]      = [];
    public _buffers          :{[name:string]:GLBuffer} = {}

    public initMeshBuffers(){
        MESH_HANDLER_DELEGATE.initMeshBuffers();
    }

    public drawMesh( mesh : GLMesh ){
        MESH_HANDLER_DELEGATE.drawMesh( mesh );
    }
    
    public RenderFrame(){
        this.MATERIALS.forEach( material => {
            

            this.SHADERS.get(material.shader).use();
            material.bind();
            TEXTURE_HANDLER_DELEGATE.bindTextures(material.textures, material.cubeTextures);


            
            material._meshIndicees.forEach( meshIndex => {
                if( meshIndex !== undefined ){
                    var a = material;
                    var m = this.MESHES.get (meshIndex);
                    MESH_HANDLER_DELEGATE.drawMesh( m );
                }
            });
            
        });    
    }





    // ## --- --- --- ##  --- --- --- ##  --- --- --- ## MESH
   
    private _meshNameGenerator(){ return "MESHNAME_" + this.MESHES.length;}

    public registerMesh( mesh : GLMesh ){
       
        var a = this.MESHES;
        var b = this.MESHES.hasIndex(mesh.name);
        if( this.MESHES.hasIndex(mesh.name) ){
            return this.MESHES.getHash(mesh.name);
        }else{
            if( mesh.name == undefined || mesh.name == null ||mesh.name =="" ){
                mesh.name = this._meshNameGenerator();
            }
            this.MESHES.add(mesh, mesh.name);
            mesh.Index = this.MESHES.length;
            return mesh;
        }
    }

    // ## --- --- --- ##  --- --- --- ##  --- --- --- ## MATERIAL
    
    public requestMaterialIndexHash( material : string ){
        if( this.MATERIALS.hasIndex(material) )
            return this.MATERIALS.getIndex(material);
        return -1;
    }

    public requestMaterialIndex( material : GLAMaterial ){
        if( this.MATERIALS.hasIndex( material.name )){
            return this.MATERIALS.getIndex( material.name );
        } else {
            this.MATERIALS.add(material, material.name );
            return this.MATERIALS.getIndex( material.name );
        }
    }

    // ## --- --- --- ##  --- --- --- ##  --- --- --- ##  SHADER 
    
    public requestUseShader(        shaderI : number ){                 SHADER_HANDLER_DELEGATE.requestUseShader(shaderI);      }

    public requestShader(           shader  : string )  : number {return SHADER_HANDLER_DELEGATE.requestShader(shader);  }

    // ## --- --- --- ##  --- --- --- ##  --- --- --- ## Texture


    public registerTexture( texture : GLTexture){
        if(!this.TEXTURES.hasIndex(texture.name)){
            this.TEXTURES.add( texture, texture.name );
        }
    }

    public requestTextureindex(     request : string ) : number { 
        if( this.TEXTURES.hasIndex(request) ){
            return this.TEXTURES.getIndex(request);
        }else{
            this.TEXTURES.add( new LoadableTexture(request) , request );
            return this.TEXTURES.getIndex(request);
        }
    }

    public requestCubeTextureindex( request : string ) : number{

        if( this.CUBETEXTURES.hasIndex(request) ){
            return this.CUBETEXTURES.getIndex(request);
        }else{
            throw Error("CubeTexture NOT LOADED! " + request + " \n , Cubetextures must be loaded before Running Context, See Context.PreLoadCubeTexture, must run before requesting texture ");
        }
    }

    public PreLoadCubeTexture(      requests : string[] ){
        this.CUBETEXTURES.addMKeys( new CubeMapTexture(requests) , requests );
        return this.CUBETEXTURES.getIndex(requests[1]);
    }

    // ## --- --- --- ##  --- --- --- ##  --- --- --- ##

    public bindMaterial(){}
    public bindShader(){}
    public bindLight(){}

}
class MESH_HANDLER_DELEGATE{
    public static initMeshBuffers(){
        
        CONTEXT._bufferNames.push("uv");
        CONTEXT._buffers["uv"]   = new GLBuffer(2, gl.FLOAT, gl.ARRAY_BUFFER, gl.STATIC_DRAW);
        
        CONTEXT._bufferNames.push("loc");
        CONTEXT._buffers["loc"]  = new GLBuffer(3, gl.FLOAT, gl.ARRAY_BUFFER, gl.STATIC_DRAW);
        
        CONTEXT._bufferNames.push("face");
        CONTEXT._buffers["face"] = new GLBuffer(123, gl.UNSIGNED_SHORT, gl.ELEMENT_ARRAY_BUFFER, gl.TRIANGLES);

    }
    public static drawMesh( mesh : GLMesh ){
        
        // --- vertex location --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
        CONTEXT._buffers["loc"].bind();
        CONTEXT._buffers["loc"].addAttribute( new AttributeInfo( CONTEXT.currentShader.getAttributeLocation("a_position") , 3, 0) );
        CONTEXT._buffers["loc"].pushData( mesh.verticies );
        CONTEXT._buffers["loc"].upload();
        // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---

        // --- vertex uv-- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
        CONTEXT._buffers["uv"].bind();
        CONTEXT._buffers["uv"].addAttribute( new AttributeInfo( CONTEXT.currentShader.getAttributeLocation("a_texCord"), 2, 0) );
        CONTEXT._buffers["uv"].pushData( mesh.texCoords );
        CONTEXT._buffers["uv"].upload();
        // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
        
        // --- faces vertex indicies-- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
        CONTEXT._buffers["face"].bind();
        CONTEXT._buffers["face"].pushData( mesh.faceIndecies );
        CONTEXT._buffers["face"].upload();
        // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---

        CONTEXT._buffers["face"].draw();

        CONTEXT._buffers["loc" ].unbind();
        CONTEXT._buffers["uv"  ].unbind();
        CONTEXT._buffers["face"].unbind();

    }
}

class MATERIAL_HANDLER_DELEGATE{

    private static bind( material : GLAMaterial ){

        gl.uniformMatrix4fv( CONTEXT.currentShader.getUniformLocation("worldMatrix") , false, CONTEXT.ActiveWorld .getWorldMatrix().values          );
        gl.uniformMatrix4fv( CONTEXT.currentShader.getUniformLocation("viewMatrix" ) , false, CONTEXT.ActiveCamera.getViewMatrix().values           );
        gl.uniformMatrix4fv( CONTEXT.currentShader.getUniformLocation("projMatrix" ) , false, CONTEXT.ActiveCamera.getProjectionMatrix().values     );


        gl.uniform3fv(  
            CONTEXT.currentShader.getUniformLocation( "eyePosition" ),
            CONTEXT.ActiveCamera.position.xyz
        );
                
        gl.uniformMatrix4fv(
            CONTEXT.currentShader.getUniformLocation( "reflectionMatrix" ),
            false,
            material.reflectionMatrix.values
        );
    }

    private static unbind(material : GLAMaterial){
        /*
        material.data.forEach( data => {
            gl.uniform1i(data.uniform , null );
            data.Texture.unBind();
        });*/
    }
}

class SHADER_HANDLER_DELEGATE{
    public static requestUseShader(        shaderI : number ){
        CONTEXT.SHADERS[shaderI].use();
    }
    private static AddAndReturn(shader :GLShader): number {
        if(CONTEXT.SHADERS.hasIndex( shader.getType() ) ){
            return CONTEXT.SHADERS.getIndex( shader.getType() );
        }else{
            CONTEXT.SHADERS.add( shader, shader.getType() );
            return CONTEXT.SHADERS.getIndex( shader.getType()  );
        }
    }
    public static requestShader( shader : string )  :number {

        if(CONTEXT.SHADERS.hasIndex(shader)){
            return CONTEXT.SHADERS.getIndex(shader);

        }else{
            switch(shader){
                case ShaderBackground.getType()     :
                    return SHADER_HANDLER_DELEGATE.AddAndReturn( new ShaderBackground("ShaderBackground") );

                case DefaultShadowShader.getType()  :
                    return SHADER_HANDLER_DELEGATE.AddAndReturn( new DefaultShadowShader("DefaultShadowShader") );

                case DefaultShader.getType()        :
                    return SHADER_HANDLER_DELEGATE.AddAndReturn( new DefaultShader("DefaultShader") );

                case ShadowMAPShader.getType()      :
                    return SHADER_HANDLER_DELEGATE.AddAndReturn( new ShadowMAPShader("ShadowMAPShader") );

                default:
                    throw Error("Shader Request Denied: key was Unrecognised, was " + shader);
            }
        }
        
    }

}

class TEXTURE_HANDLER_DELEGATE {
    
    public static bindTextures( Textures :GlTexData[], CubeTexures :GlTexData[]){
        
        function getToBeUnused( arr : GlTexData[] , carr : GlTexData[]) : GlTexData[] {
            let rtr : GlTexData[] = [] ;
            let data = CONTEXT.currentShader.ShaderTextureData;

            let size = (arr.length > carr.length) ? arr.length : carr.length;
            let NO_MATCH = true;
            for (let i = 0; i < size; i++){
                for (let q = 0; q < size ; q++) {
                    
                    if( i < arr.length - 1 )
                        if( data.get(q).index == arr[i].index)
                            NO_MATCH = false;

                    if( i < carr.length - 1 )
                        if( data.get(q).index == carr[i].index)
                            NO_MATCH = false;
                    
                    if(NO_MATCH)
                        rtr.push(   data.get(i)    );
                }       
            }
            return rtr;
        }

        var a = getToBeUnused(Textures,CubeTexures);
        
        a.forEach( data => {
            TEXTURE_HANDLER_DELEGATE.bindTexture( ( data.context_texture_id = CONTEXT._emptyTextureIndex) );
        });

        CubeTexures.forEach( data  => {
            TEXTURE_HANDLER_DELEGATE.bindTexture( data );
        });

        Textures.forEach( data => {
            TEXTURE_HANDLER_DELEGATE.bindTexture( data );
        });

    } 

    public static bindTexture( tex : GlTexData){}
}
