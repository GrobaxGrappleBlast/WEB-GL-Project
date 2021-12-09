import { mat4 } from '../Math/TSM_Library/mat4';
import { GLOBAL_WORLD } from './World';
export class Node{

    PARENT_INDEX    : number;
    CHILDREN_INDICES: number[];
    INDEX           : number;
    NAME            : string;

    transformOffset : mat4;
    transform       : mat4;

    meshIndex : number = null ;    

    public constructor(
        name            : string,
        PARENT_INDEX    : number,
        INDEX           : number,
        transform       : mat4
    ){
        this.NAME = name;
        this.PARENT_INDEX = PARENT_INDEX;
        this.INDEX = INDEX;
        this.transform = transform;
    }

    ApplyOffset( offset : mat4 , tree : Node[] ){
 
        this.transformOffset = this.transform.multiply(offset);
        

        if(this.CHILDREN_INDICES)
            this.CHILDREN_INDICES.forEach( i => {

                if(tree === undefined)
                    console.log("TREE UNDEFINED");
                
                if(tree[i] === undefined)
                    console.log("TREE I UNDEFINED");

                tree[i].ApplyOffset( this.transformOffset , tree );
            });

        if(this.meshIndex){

            if(GLOBAL_WORLD.MESHES == undefined){
                console.log("HEJ - UNDEFINED GLOBALWORLD MESH");
            }else if(GLOBAL_WORLD.MESHES[this.meshIndex] == undefined) {
                console.log("HEJ - UNDEFINED GLOBALWORLD MESH["+this.meshIndex+"]" );
            }
            GLOBAL_WORLD.MESHES[this.meshIndex].changeTransform( this.transformOffset);
        }
    }

}
