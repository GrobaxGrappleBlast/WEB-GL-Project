import { Quaternion, Euler } from 'three';
import { vec3 } from './TSM_Library/vec3';

export class MATH{
    
    public static fromQtoV( x:number, y:number, z:number, w:number ): vec3{
        var Q = new Quaternion(x,y,z,w);
        var rtrn : Euler = new Euler();
        rtrn.setFromQuaternion(Q, Euler.DefaultOrder);
        var VECTOR = rtrn.toVector3();
        return new vec3([VECTOR.x , VECTOR.y, VECTOR.z ]);
    }
}