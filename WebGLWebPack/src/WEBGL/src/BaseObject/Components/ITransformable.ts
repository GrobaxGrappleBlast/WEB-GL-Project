import { mat4 } from '../../Math/TSM_Library/mat4';
export interface ITransformable{
    changeTransform(transform : mat4)
}