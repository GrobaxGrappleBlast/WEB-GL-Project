import { mat4 } from '../../Math/TSM_Library/mat4';
export interface ITransformable{
    ApplyTransform(transform : mat4)
}