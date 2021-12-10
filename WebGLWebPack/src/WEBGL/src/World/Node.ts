import { mat4 } from '../Math/TSM_Library/mat4';
import { GLOBAL_WORLD } from './World';
import { vec3 } from '../Math/TSM_Library/vec3';
import { MATH } from '../Math/general';
export class Node{

    PARENT_INDEX    : number;
    CHILDREN_INDICES: number[];
    INDEX           : number;
    NAME            : string;

    startTransform  : mat4 = null;
    transformOffset : mat4 = mat4.getIdentity();
    transform       : mat4 = mat4.getIdentity();

    meshIndex : number = null ;    

    public constructor(
        name            : string,
        PARENT_INDEX    : number,
        INDEX           : number,
    ){
        this.NAME = name;
        this.PARENT_INDEX = PARENT_INDEX;
        this.INDEX = INDEX;
       
    }

    ApplyOffset( offset : mat4 , localTrans:mat4, tree : Node[] ){
 
      
        this.transformOffset = mat4.getIdentity().multiply(offset); // .multiply(this.startTransform);         
        var Local = mat4.getIdentity().multiply(this.startTransform).multiply(localTrans);

        if(this.CHILDREN_INDICES)
            this.CHILDREN_INDICES.forEach( i => {
                tree[i].ApplyOffset( this.transformOffset, Local , tree );
            });

        if(this.meshIndex){
            GLOBAL_WORLD.MESHES[this.meshIndex].changeTransform( this.transformOffset );
            GLOBAL_WORLD.MESHES[this.meshIndex].changeLocalTransform( Local );
        }

    }


    public hasNULLValue( arr : mat4 ):boolean{
        arr.values.forEach( e => {
            if(e == NaN)
                return true;
        });
        return false;
    }

    public giveOriginalTranslationMatrix( mat : mat4){
        
        var scaleX = new vec3([
            mat.values[0],
            mat.values[4],
            mat.values[8],
        ]).length();

        var scaleY = new vec3([
            mat.values[1],
            mat.values[5],
            mat.values[9],
        ]).length();

        var scaleZ = new vec3([
            mat.values[2] ,
            mat.values[6] ,
            mat.values[10],
        ]).length();
        
        
        
        var o = mat.values;
        var r : number[] = [
            (o[0]/scaleX ), (o[1]/scaleY ), (o[2]/scaleZ ) ,    0,
            (o[4]/scaleX ), (o[5]/scaleY ), (o[6]/scaleZ ) ,    0,
            (o[8]/scaleX ), (o[9]/scaleY ), (o[10]/scaleZ ),    0,
                        0,              0,          0,          0
        ];
        
        
       
        var tx = mat.values[3];
        var ty = mat.values[7];
        var tz = mat.values[11];

        var a = mat4.getIdentity();
        //a = a.rotate( scaleX, new vec3([1.0,0.0,0.0]) );
        //a = a.rotate( scaleY, new vec3([0.0,1.0,0.0]) );
        //a = a.rotate( scaleZ, new vec3([0.0,0.0,1.0]) );
        
        a = a.translate(new vec3([tx,ty,tz]));
        
        var tx2 = a.inverse().values[3];
        var ty2 = a.inverse().values[7];
        var tz2 = a.inverse().values[11];

        console.log(" HEJ MED DIG SE MIG HER  \n \n HASHSHSH H HA ");
        this.startTransform = mat4.getIdentity() //new mat4(rotationMatrix);// new mat4(rotationMatrix);
        


    }
}
