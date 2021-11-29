import { DefaultCube } from "./Drawable";
import { IFileRequestResponse } from '../Loader/IFileRequestResponse';
import { FileRequest } from '../Loader/FileReuqest';
import { JSON3D, JSONAsset } from '../Loader/Assets/Loaders/JSONAssetLoader';
import { Mesh } from './Components/Mesh';
import { IAsset } from '../Loader/Assets/IAsset';


export class LoableDrawable extends DefaultCube implements IFileRequestResponse{
    
    public constructor(resource:string){
        super();
        
        var fr = new FileRequest(resource, this);
    }

    public onFileRecieved( asset : any){
       
        var ASSET : JSON3D = asset.data;
        var length :number = ASSET.meshes.length;
        console.log("MESH LENGTH IS " + length);


        var _meshes : Mesh[] = [];
        console.log(_meshes);
        
        for (let i = 0; i < length; i++)
        {
            var mesh = ASSET.meshes[i];
            var faceArr:number[] = [];
            var f = 0;

            mesh.faces.forEach(face => {
                face.forEach( vertIndex => {
                    faceArr.push( vertIndex );
                });
            });

            _meshes.push( new Mesh(
                mesh.vertices,
                mesh.texturecoords[0],
                faceArr    
            ));
        }
        this._mesh = _meshes[0];
       
    }
    
}