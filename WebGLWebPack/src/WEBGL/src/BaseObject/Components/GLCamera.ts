import { vec3 } from '../../Math/TSM_Library/vec3';
import { mat4 } from '../../Math/TSM_Library/mat4';
import { toRadians } from '../../Math/TSM_Library/constants';
import { gl } from '../GL/webGlUtil';
import { CONTEXT } from '../../Context';
export class GLCamera{

    public position     : vec3;
    public lookat       : vec3;
    public updirection  : vec3;



    private height  : number = gl.canvas.width;
    private width   : number = gl.canvas.height;
    public angle    : number = 45;

    
    public constructor(
        position    : vec3,
        lookat      : vec3,
        updirection : vec3,
        angle       : number = 90
    ){
        this.position   = position    ;
        this.lookat     = lookat      ;
        this.updirection= updirection ;
        this.angle      = angle;
    }


    getViewMatrix(){
        return  mat4.lookAt( this.position, this.lookat, this.updirection);
    }

    getProjectionMatrix(){
        return mat4.perspective( toRadians(this.angle), (this.height / this.width ), 0.1, CONTEXT.FarPlaneCoordinate );
    }

    public setDimensions( nHeight :number = null , nWidth:number = null){
        if(nHeight == null){ this.height = gl.canvas.height ; }else{ this.height= nHeight; }
        if(nWidth  == null){ this.width  = gl.canvas.width ; }else{  this.width = nWidth;  }
    }


}