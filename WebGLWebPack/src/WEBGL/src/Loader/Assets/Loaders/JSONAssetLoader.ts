import { AssetManager } from "../AssetManager";
import { IAsset } from "../IAsset";
import { IAssetLoader } from "./IAssetLoader";
import { GLMesh } from '../../../BaseObject/Components/GLMesh';
import { GLMaterial } from "../../../BaseObject/Components/GLMaterial";
import { GLLight } from '../../../BaseObject/Components/GLLIght';
import { GLCamera } from '../../../BaseObject/Components/GLCamera';
import { mat4 } from '../../../Math/TSM_Library/mat4';
import { Node } from '../../../World/Node';


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
    
    private nameMat : {[name:string]:number} = {};
    private _mats : GLMaterial[];

    private nameMesh : {[name:string]:number} = {};
    private _meshs: GLMesh[];

    private nameTree : {[name:string]:number} = {}
    private NodeTree : Node[]; 

    public constructor(asset : JSON3D){
        this.ASSET = asset;

        this._mats = new Array<GLMaterial>  (this.ASSET.materials.length);
        this._meshs= new Array<GLMesh>      (this.ASSET.meshes.length   );

        var c = 0;
        this.ASSET.materials.forEach(   imat => {
            this._mats[ c ] = this.OperateMaterial(imat) ;
            this.nameMat[ this._mats[c].name() ] = c;
            this._mats[ c ].Index = c++;
            
        });

        c = 0;
        this.ASSET.meshes.forEach(      imesh => {
            var mesh = this.OperateMesh(imesh);
            
            mesh.MaterialIndex = imesh.materialindex;
            mesh.Index = c ;
            mesh.name = imesh.name;
            this.nameMesh[imesh.name] = c;

            this._mats[imesh.materialindex]._meshIndicees.push(c);
            this._meshs[c++] = mesh;
        });

        var arrName : string[] = [];
        asset.animations.forEach(       anim => {
            arrName.push(anim.name);
        }); 

        // LOAD MATERIALS INTO MESHES 
        this._mats.forEach(   MAT =>  {
            MAT._meshIndicees.forEach( meshIndex => {
                this._meshs[meshIndex].loadShaderLocations(MAT);
            });
        });

        var count : number = this.DFC(this.ASSET.rootnode);
        this.NodeTree = new Array<Node>(count);
        this.c = 0;
        this.DFL( asset.rootnode );
    }
 
    private c = 0;


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
                c.INDEX,
                //new mat4(c.INODE.transformation)
                mat4.getIdentity() // identity. Because rotations scales and translations are wrontgly already applied at exported. 
            );

            // IF MATCHES A MESH LIGHT OR CAMERA OR OTHER; 
            // MESH 
            if(   this.nameMesh[c.INODE.name]   ){
                // THIS IS A MESH. 
                newNode.meshIndex = this.nameMesh[c.INODE.name] ;// newNode.INDEX; // ####################################################
            }
                

            // IF CHILD NODES 
            if(c.INODE.children){
                
                newNode.CHILDREN_INDICES = [];
                c.INODE.children.forEach( e => {
                    newNode.CHILDREN_INDICES.push( indexCounter++ );
                });

                for (let i = 0; i < c.INODE.children.length; i++) {
                   // var addition : { i : number , a : number  , node : NodeElement} = { c.INDEX , newNode.CHILDREN_INDICES[i]  , INODE.children[i]}
                    var S : semiNode = new semiNode();
                    S.PARENT_INDEX  = c.INDEX;
                    S.INDEX         = newNode.CHILDREN_INDICES[i];
                    S.INODE         = c.INODE.children[i]; 
                    que.push( S );
                }
            }
        
            // 
            this.nameTree[  INODE.name  ]   = c.INDEX;
            this.NodeTree[  c.INDEX     ]   = newNode;
            if(que.length == 0){
                RUNS = false;
            }

        }
    }


    private OperateMaterial( mat: Material):GLMaterial{
        return new GLMaterial("default");
    }

    private OperateMesh( mesh: Mesh):GLMesh{
        return new GLMesh(
            mesh.vertices,
            mesh.texturecoords[0],
            [].concat.apply( [] , mesh.faces ),
            mesh.normals
        );
    }

    private OperateLight( light: Light):GLLight{
        return new GLLight();
    }

    private OperateCameras( cam: Camera ):GLCamera{
        return new GLCamera();
    }

    public getMeshes() : GLMesh[] {
        return this._meshs;
    }

    public getMaterials() : GLMaterial[] {
        return this._mats;
    }

    public getNodeTree() : Node[ ]{
        return this.NodeTree;
    }

    public getNodeTreeNames() : {[name:string]:number}{
        return this.nameTree;
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

