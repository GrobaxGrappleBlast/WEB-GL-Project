import { mat4 } from '../Math/TSM_Library/mat4';
import { GLOBAL_WORLD } from './World';
export class Node{

    PARENT_INDEX    : number;
    CHILDREN_INDICES: number[];
    INDEX           : number;
    NAME            : string;

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

    ApplyOffset( offset : mat4 , tree : Node[] ){
 
        //console.log("APPLY OFFSET = " + offset)
       
        this.transformOffset = mat4.getIdentity().multiply(offset);         

        if( this.hasNULLValue(this.transformOffset) ){
            console.log("SOMETHING IS WRONG NOW");
            var a = this.transform.copy(a);
            var a = a.multiply(offset);
        }

        if(this.CHILDREN_INDICES)
            this.CHILDREN_INDICES.forEach( i => {
                tree[i].ApplyOffset( this.transformOffset , tree );
            });

        if(this.meshIndex){
            GLOBAL_WORLD.MESHES[this.meshIndex].changeTransform( this.transformOffset);
        }
    }


    public hasNULLValue( arr : mat4 ):boolean{
        arr.values.forEach( e => {
            if(e == NaN)
                return true;
        });
        return false;
    }
}
