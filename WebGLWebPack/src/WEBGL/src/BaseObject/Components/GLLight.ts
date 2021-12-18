import { vec4 } from '../../Math/TSM_Library/vec4';
import { mat4 } from '../../Math/TSM_Library/mat4';
import { vec3 } from '../../Math/TSM_Library/vec3';
import { GLCamera } from './GLCamera';
import { GLShader } from '../GL/GLShader';
import { gl } from '../GL/webGlUtil';
import { CONTEXT } from '../../Context';


// source https://www.youtube.com/watch?v=UnFudL21Uq4
// source is for camera taktik, up values and Render technique
export class GLPointLight{

    private position: vec3 ;
    private viewers : GLCamera[] = new Array<GLCamera>(6);
    private shadowShader : ShadowMAPShader;

    //  SHADOW MAP COMPONENTS 
    private shadowDepthTextureSize = 512;
    private shadowClipNear  = 0.5;
    private shadowClipFar   = 10 ;

    private static shadowCube : WebGLTexture;
    private static shadowBuffer : WebGLFramebuffer;
    private static shadowRenderBuffer: WebGLRenderbuffer;

    public constructor(
        position: vec3
    ){
        this.position = position;

        if(!GLPointLight.shadowCube)
            GLPointLight.shadowCube = gl.createTexture();

        if(!GLPointLight.shadowBuffer)
            GLPointLight.shadowBuffer = gl.createFramebuffer();

        if(!GLPointLight.shadowRenderBuffer)
            GLPointLight.shadowRenderBuffer = gl.createRenderbuffer();

                                    // MY START POS     // WHERE I AM LOOKING AT.               // source https://www.youtube.com/watch?v=UnFudL21Uq4
        // pos x
        this.viewers[0] = new GLCamera( this.position, this.position.add( new vec3([ 1.0,0.0,0.0]) ),  new vec3([ 0.0,-1.0,0.0 ])  );
        // neg x.add()
        this.viewers[1] = new GLCamera( this.position, this.position.add( new vec3([-1.0,0.0,0.0]) ),  new vec3([ 0.0,-1.0,0.0 ])  );
        // pos y.add()
        this.viewers[2] = new GLCamera( this.position, this.position.add( new vec3([ 0.0,1.0,0.0]) ),  new vec3([ 0.0, 0.0,1.0 ])  );
        // neg y.add()
        this.viewers[3] = new GLCamera( this.position, this.position.add( new vec3([ 0.0,-1.0,0.0])),  new vec3([ 0.0, 0.0,-1.0])  );
        // pos z.add()
        this.viewers[4] = new GLCamera( this.position, this.position.add( new vec3([ 0.0,0.0,1.0]) ),  new vec3([ 0.0,-1.0,0.0 ])  );
        // neg z.add()
        this.viewers[5] = new GLCamera( this.position, this.position.add( new vec3([ 0.0,0.0,-1.0])),  new vec3([ 0.0,-1.0,0.0 ])  );

    
        this.shadowShader = new ShadowMAPShader();
        
        this.shadowShader.use();
        gl.bindTexture( gl.TEXTURE_CUBE_MAP, GLPointLight.shadowCube );
        gl.texParameteri( gl.TEXTURE_CUBE_MAP , gl.TEXTURE_WRAP_S     , gl.MIRRORED_REPEAT );
        gl.texParameteri( gl.TEXTURE_CUBE_MAP , gl.TEXTURE_WRAP_T     , gl.MIRRORED_REPEAT );
        gl.texParameteri( gl.TEXTURE_CUBE_MAP , gl.TEXTURE_MIN_FILTER , gl.LINEAR);
        gl.texParameteri( gl.TEXTURE_CUBE_MAP , gl.TEXTURE_MAG_FILTER , gl.LINEAR);

        for (let i = 0; i < 6; i++) {
            gl.texImage2D(
                gl.TEXTURE_CUBE_MAP_POSITIVE_X +i,
                0,
                gl.RGBA,
                this.shadowDepthTextureSize, this.shadowDepthTextureSize,
                0,
                gl.RGBA,
                gl.UNSIGNED_BYTE, null
                );
        }

        gl.bindFramebuffer(gl.FRAMEBUFFER,GLPointLight.shadowBuffer, );
        gl.bindRenderbuffer(gl.RENDERBUFFER, GLPointLight.shadowRenderBuffer);
        gl.renderbufferStorage(
            gl.RENDERBUFFER,
            gl.DEPTH_COMPONENT16,
            this.shadowDepthTextureSize,
            this.shadowDepthTextureSize
            );


        gl.bindTexture( gl.TEXTURE_CUBE_MAP , null   );
        gl.bindFramebuffer(gl.FRAMEBUFFER   , null   );
        gl.bindRenderbuffer(gl.RENDERBUFFER , null   );

    }



    public renderShadow(){
        
        /*
        this.shadowShader.use();
        gl.bindTexture( gl.TEXTURE_CUBE_MAP, GLPointLight.shadowCube );
        gl.bindFramebuffer(gl.FRAMEBUFFER,GLPointLight.shadowBuffer, );
        gl.bindRenderbuffer(gl.RENDERBUFFER, GLPointLight.shadowRenderBuffer);
        gl.viewport(0,0,this.shadowDepthTextureSize,this.shadowDepthTextureSize )

        gl.enable(gl.DEPTH_TEST);
        gl.enable(gl.CULL_FACE);

        //this.shadowShader.getAttributeLocation
        // SET UNIFORMS FOR THIS FRAME
       
        gl.uniform2fv( this.shadowShader.getUniformLocation("shadowClipping"), [this.shadowClipNear, this.shadowClipFar] );
        gl.uniform3fv( this.shadowShader.getUniformLocation("lightPosition"), this.position.xyz );
        gl.uniformMatrix4fv( this.shadowShader.getUniformLocation("worldMatrix"),false, GLOBAL_WORLD.getWorldMatrix().values );

        for (let i = 0; i < this.viewers.length ; i++) {
            // FOR EACH VIEW
            gl.uniformMatrix4fv(this.shadowShader.getUniformLocation("viewMatrix"),false,this.viewers[i].getViewMatrix()      .values  );
            gl.uniformMatrix4fv(this.shadowShader.getUniformLocation("projMatrix"),false,this.viewers[i].getProjectionMatrix().values  );    
            

            // DRAW THE FUCKING THING.
            gl.framebufferTexture2D(
                gl.FRAMEBUFFER,
                gl.COLOR_ATTACHMENT0,
                gl.TEXTURE_CUBE_MAP_POSITIVE_X + i,
                GLPointLight.shadowCube,
                0
            )

            gl.framebufferRenderbuffer(
                gl.FRAMEBUFFER,
                gl.DEPTH_ATTACHMENT,
                gl.RENDERBUFFER,
                GLPointLight.shadowRenderBuffer
            )

            gl.clearColor(1,1,1,1);
            gl.clear(gl.COLOR_BUFFER_BIT |gl.DEPTH_BUFFER_BIT);
          

            CONTEXT.MESHES.forEach( mesh =>{
                //mesh.draw(this.shadowShader);
            });


        }

        //  unbind After
        gl.viewport(0,0,gl.canvas.width,gl.canvas.height )
        gl.bindTexture( gl.TEXTURE_CUBE_MAP , null   );
        gl.bindFramebuffer(gl.FRAMEBUFFER   , null   );
        gl.bindRenderbuffer(gl.RENDERBUFFER , null   );

        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.bindRenderbuffer(gl.RENDERBUFFER, null);
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, null);

        return GLPointLight.shadowCube;
        */
    }

    public bindToCurrentMaterial(){
        
    }
  /*  public unbind(){
        private shadowCube = gl.createTexture();
        private shadowBuffer : WebGLFramebuffer = gl.createFramebuffer();
        private shadowRenderBuffer = gl.createRenderbuffer();
    }
*/
    
	
}

export class ShadowMAPShader extends GLShader{
    public static type : string = "defaultShadow";
    public override getType():string{
        return ShadowMAPShader.type;
    }
    public static override getType(){
        return ShadowMAPShader.type;
    };

    public constructor(name : string = "shader"){
        
        let  _vShaderSource : string = `	
        
        precision mediump float;

        attribute vec3 a_position;
        attribute vec2 a_texCord;
        attribute vec3 a_normal;

        uniform mat4 worldMatrix;
        uniform mat4 viewMatrix;
        uniform mat4 projMatrix;
        

        varying vec3 fragmentPosition;

        void main(){
            vec4 test = vec4(a_normal + vec3(a_texCord, 1.0),0.0);
            fragmentPosition = ( worldMatrix * vec4(a_position,1.0) ).xyz ; 

            vec4 p = vec4(fragmentPosition,1.0) + (0.0 * test) ;
            gl_Position = projMatrix * viewMatrix * p;
        }

        `;

        let _fShaderSource : string = `

        // SOURCE : https://www.youtube.com/watch?v=UnFudL21Uq4
        precision mediump float;
        
        varying vec3 fragmentPosition;
        
        uniform vec3 lightPosition;
        uniform vec2 shadowClipping;
        
        void main(){

            vec3 fromLightToFrag = (fragmentPosition - lightPosition);

            float lightFragDist =
                (length(fromLightToFrag) - shadowClipping.x)
                /
                (shadowClipping.y - shadowClipping.x);

            gl_FragColor = vec4(lightFragDist, lightFragDist, lightFragDist, 1.0);
        }
        `;			
        super("SHADOWLIGHT_"+name, _vShaderSource, _fShaderSource);
    }
}	

