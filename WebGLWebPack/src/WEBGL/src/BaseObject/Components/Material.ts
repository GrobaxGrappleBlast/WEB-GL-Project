import { Shader, DefaultShader } from '../GL/Shader';
import { vec3 } from '../../Math/TSM_Library/vec3';
import { vec2 } from '../../Math/TSM_Library/vec2';
import { mat4 } from '../../Math/TSM_Library/mat4';
import { gl } from '../GL/webGlUtil';

export class Material{

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