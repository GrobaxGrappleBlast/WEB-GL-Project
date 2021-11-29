

import { JSON3D, Property } from '../Loader/Assets/Loaders/JSONAssetLoader';

export class MaterialProperty implements Property{
    public key: string;
    public semantic: number;
    public index: number;
    public type: number;
    public value: string | number | number[];
    
    public constructor(
        key      :string=null,
        semantic :number=null,
        index    :number=null,
        type     :number=null,
        value    :string | number | number[]=null
    ){
        this.key     = key      ;
        this.semantic= semantic ;
        this.index   = index    ;
        this.type    = type     ;
        this.value   = value    ;
    }
}
export class Material implements Material{
    public properties : MaterialProperty[];
    public constructor( properties : MaterialProperty[] ){
        properties = properties;
    }
}

export class scene {

    public constructor(){
        
    }

    public onFileRecieved( asset : JSON3D){
        /*
        // HANDLE MATERIALS 
        var Materials : Material[] = new Material[asset.materials.length];
        for (let i = 0; i < asset.materials.length; i++) {
            
            var mat = Materials[i];
            var properties : MaterialProperty[] = new MaterialProperty[mat.properties.length];
            
            for (let p = 0; p < mat.properties.length; p++) {
                var prop = mat.properties[p];
                properties[p] = new MaterialProperty(
                    prop.key,
                    prop.semantic,
                    prop.index,
                    prop.type,
                    prop.value
                );
            }
            Materials[i] = new Material(properties);
        };
        */
        

     
        

    }
}