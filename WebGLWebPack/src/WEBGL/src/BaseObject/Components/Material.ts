import { Shader, DefaultShader } from '../GL/Shader';
import { vec3 } from '../../Math/TSM_Library/vec3';
import { vec2 } from '../../Math/TSM_Library/vec2';
import { mat4 } from '../../Math/TSM_Library/mat4';
export class Material{

    public shader : Shader;
    public name   : string;  
    public constructor( name : string ){
        this.name   = name;
        this.shader = new DefaultShader("Default");
    }

    public a_position   : vec3 ;    
    public a_texCord    : vec2 ;

    public worldMatrix  : mat4 ;
    public viewMatrix   : mat4 ;
    public projMatrix   : mat4 ;

}