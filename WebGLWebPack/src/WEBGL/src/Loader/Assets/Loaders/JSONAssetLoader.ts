import { AssetManager } from "../AssetManager";
import { IAsset } from "../IAsset";
import { IAssetLoader } from "./IAssetLoader";
import { GLMesh } from '../../../BaseObject/Components/GLMesh';
import { GLMaterial, TextureDataInput } from '../../../BaseObject/Components/GLMaterial';
import { mat4 } from '../../../Math/TSM_Library/mat4';
import { HashArray } from '../../../BaseObject/HashArray';
import { vec3 } from "../../../Math/TSM_Library/vec3";
import { CubeMapTexture, GLTexture } from '../../../BaseObject/Components/GLTexture';


export class JSONAsset implements IAsset{
    public readonly name: string;
    public readonly data: JSON_3DSCENE_SORTER;
    public constructor(name:string , data:JSON_3DSCENE_SORTER){
        this.name = name;
        this.data = data;
    }
}

export class JSONAssetLoader implements IAssetLoader{

    public get supportedExtensions(): string[] {
        return ["json"];
    }
    public LoadAsset(assetName: string): void {
        var rawFile = new XMLHttpRequest();
        rawFile.overrideMimeType("application/json");
        rawFile.open("GET", assetName, true);
        rawFile.onreadystatechange = function() {
            if (rawFile.readyState === 4) {
                
                JSONAssetLoader.onload(assetName,rawFile.responseText);

            }
        }
        rawFile.send(null);

    }

    private static onload(assetName:string ,rawData : string ):void{
        var JsonAsset : JSON3D =  JSON.parse(rawData ) ;
        var sorter : JSON_3DSCENE_SORTER = new JSON_3DSCENE_SORTER(JsonAsset);

        var asset = new JSONAsset(assetName,sorter);   
        AssetManager.onAssetLoaded(asset);
    }
}


export class JSON_3DSCENE_SORTER{
    
    private ASSET : JSON3D;
    
    private matArr  : HashArray<GLMaterial> = new HashArray<GLMaterial>()   ;
    private meshArr : HashArray<GLMesh>     = new HashArray<GLMesh>()       ;
    
    private nodeTree: Node[]       ;//= new HashArray<Node>()         ;
    private nodeTreeLookup : {[name:string]:number} = {};

// ### --- ### --- ### --- ### --- ### --- ### --- ### --- ### --- ### --- ### --- ### --- ### --- ### --- ### --- ### --- ### --- ### --- 

    public constructor(asset : JSON3D){
        this.ASSET = asset;

        // MATERIALS 
        //var c = 0;
        //this.ASSET.materials.forEach(   imat => {
        //    var material = this.OperateMaterial(imat) ;
        //    this.matArr.add( 
        //        material,
        //        "default" + c++ + ""
        //    )
        //});

        // MESHES 
        var c = 0;
        this.ASSET.meshes.forEach(      imesh => {
            
            var mesh = this.OperateMesh(imesh);
            mesh.MaterialIndex = imesh.materialindex;
            mesh.Index = c ;
            mesh.name = imesh.name;

            this.meshArr.add(mesh, imesh.name);
            //    this.matArr.get(imesh.materialindex)._meshIndicees.push(c);
            c++;
        });


        // LOAD MATERIALS INTO MESHES 
        //this.matArr.forEach( MAT => {
        //    MAT._meshIndicees.forEach( i => {
        //        this.meshArr.get(i).loadShaderLocations(MAT);
        //    });
        //});


    
        
        //this.nodeTree.get( 0 ).ApplyOffset(mat, this.nodeTree.getElemList() );

        /*var arrName : string[] = [];
        asset.animations.forEach(       anim => {
            arrName.push(anim.name);
        }); */
        
        
    }
 
    private c = 0;

// ### --- ### --- ### --- ### --- ### --- ### --- ### --- ### --- ### --- ### --- ### --- ### --- ### --- ### --- ### --- ### --- ### --- 
/*
    private DFC( inode : NodeElement ) : number {
        
        var counter = 0;

        if(inode.children)
        inode.children.forEach(e => {
            counter += this.DFC(e);
        });

        return counter + 1;
    }
 
    private DFL( INODE : NodeElement ):void {

        class semiNode{ 
            public PARENT_INDEX : number;
            public INDEX : number ;
            public INODE : NodeElement
            public constructor(){}
        };

        // DEPTH FIRST LOOKUP : not a search, but a look up all elements and instantiate nodes for em.
        var que : semiNode[] = [];

        let FIRST : semiNode = new semiNode();
        FIRST.PARENT_INDEX  = null  ;
        FIRST.INDEX         = 0     ;
        FIRST.INODE         = INODE ; 

        que.push(FIRST)
        var indexCounter = 1;
        var RUNS = true;

        while( RUNS ){

            var c = que.pop();
        
            // CREATE A NEW NODE 
            var newNode = new Node( 
                c.INODE.name,
                c.PARENT_INDEX,
                c.INDEX         );
                
            newNode.giveOriginalTranslationMatrix( new mat4(c.INODE.transformation) );

            // if this node is a mesh node. add that to the node
            if(    this.meshArr.hasIndex(c.INODE.name) ){
                newNode.meshIndex = this.meshArr.getIndex(c.INODE.name)
            }


            if(c.INODE.children){

                newNode.CHILDREN_INDICES = [];
                c.INODE.children.forEach( e => { newNode.CHILDREN_INDICES.push( indexCounter++ ); });

                newNode.CHILDREN_INDICES.forEach( (childIndex, i ) => {
                    var S : semiNode = new semiNode();
                    S.PARENT_INDEX  = c.INDEX;
                    S.INDEX         = childIndex;
                    S.INODE         = c.INODE.children[i]; 
                    que.push( S );
                });

            }
            
            this.nodeTreeLookup[c.INODE.name] = newNode.INDEX;
            this.nodeTree[newNode.INDEX] = newNode;

            if(que.length == 0)
                RUNS = false;
            
        }
    }

    */
// ### --- ### --- ### --- ### --- ### --- ### --- ### --- ### --- ### --- ### --- ### --- ### --- ### --- ### --- ### --- ### --- ### --- 

    private OperateMaterial( mat: Material):GLMaterial{
        return  new GLMaterial(
            "JSON",
            [
             new TextureDataInput("diffuse"     ,  GLTexture.createCheckers(8) ),
             new TextureDataInput("reflection"  ,  new CubeMapTexture() ),
            ]);
    }

    private OperateMesh( mesh: Mesh):GLMesh{
        return new GLMesh(
            mesh.vertices,
            mesh.texturecoords[0],
            [].concat.apply( [] , mesh.faces ),
            mesh.normals
        );
    }

    
// ### --- ### --- ### --- ### --- ### --- ### --- ### --- ### --- ### --- ### --- ### --- ### --- ### --- ### --- ### --- ### --- ### --- 

    public getMeshes() : GLMesh[] {
        return this.meshArr.getElemList();
    }

    public getMaterials() : GLMaterial[] {
        //return this._mats;
        return this.matArr.getElemList();
    }

    public getNodeTree() : Node[ ]{
        return this.nodeTree;
    }

// ### --- ### --- ### --- ### --- ### --- ### --- ### --- ### --- ### --- ### --- ### --- ### --- ### --- ### --- ### --- ### --- ### --- 
    
    public hasNode( hash : string):boolean{
        if ( this.nodeTreeLookup[hash] != null )
            return true;
        return false;
    }
    public getNodeindex(hash:string){
        if ( this.nodeTreeLookup[hash] != null )
            return this.nodeTreeLookup[hash];
        return null;
    }


}




// Generated by https://quicktype.io
// To change quicktype's target language, run command:
//   "Set quicktype target language"



export interface JSON3D {
    rootnode:   Rootnode;
    flags:      number;
    meshes:     Mesh[];
    materials:  Material[];
    animations: Animation[];
    lights:     Light[];
    cameras:    Camera[];
}

export interface Animation {
    name:           string;
    tickspersecond: number;
    duration:       number;
    channels:       Channel[];
}

export interface Channel {
    name:         string;
    prestate:     number;
    poststate:    number;
    positionkeys: Array<Array<number[] | number>>;
    rotationkeys: Array<Array<number[] | number>>;
    scalingkeys:  Array<Array<number[] | number>>;
}


export interface Camera {
    name:          string;
    aspect:        number;
    clipplanefar:  number;
    clipplanenear: number;
    horizontalfov: number;
    up:            number[];
    lookat:        number[];
}

export interface Light {
    name:                 string;
    type:                 number;
    attenuationconstant:  number;
    attenuationlinear:    number;
    attenuationquadratic: number;
    diffusecolor:         number[];
    specularcolor:        number[];
    ambientcolor:         number[];
    position:             number[];
}

export interface Material {
    properties: Property[];
}

export interface Property {
    key:      string;
    semantic: number;
    index:    number;
    type:     number;
    value:    number[] | number | string;
}

export interface Mesh {
    name:            string;
    materialindex:   number;
    primitivetypes:  number;
    vertices:        number[];
    normals:         number[];
    tangents:        Array<number | BitangentEnum>;
    bitangents:      Array<number | BitangentEnum>;
    numuvcomponents: number[];
    texturecoords:   Array<number[]>;
    faces:           Array<number[]>;
}

export enum BitangentEnum {
    NaN = "NaN",
}


export type NodeElement = Rootnode | RootnodeChild;
export interface Rootnode {
    name:           string;
    transformation: number[];
    children:       RootnodeChild[];
}

export interface RootnodeChild {
    name:           string;
    transformation: number[];
    meshes?:        number[];
    children?:      RootnodeChild[];
}

