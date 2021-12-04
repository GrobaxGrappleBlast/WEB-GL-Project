import { gl } from "./../BaseObject/GL/webGlUtil";
import { IDrawable } from "./../BaseObject/IDrawable";
import { toRadians } from "./../Math/TSM_Library/constants";
import { mat4 } from "./../Math/TSM_Library/mat4";
import { vec3 } from "./../Math/TSM_Library/vec3";
import { FileRequest } from '../Loader/FileReuqest';
import { JSON3D, Material, Mesh, Light, Camera, NodeElement } from '../Loader/Assets/Loaders/JSONAssetLoader';
import { GLMesh } from '../BaseObject/Components/GLMesh';
import { Drawable, DefaultCube } from '../BaseObject/Drawable';
import { DefaultShader, GLShader } from '../BaseObject/GL/GLShader';
import { GLTexture, LoadableTexture } from '../BaseObject/Components/GLTexture';
import { GLMaterial } from '../BaseObject/Components/GLMaterial';
import { GLLight } from '../BaseObject/Components/GLLIght';
import { GLCamera } from '../BaseObject/Components/GLCamera';
import { Euler, Quaternion } from 'three';


class Node{

    PARENT_INDEX    : number;
    CHILDREN_INDICES: number[];
    INDEX           : number;
    NAME            : string;

    transformOffset : mat4;
    transform       : mat4;

    meshIndex : number = null ;    

    public constructor(
        name: string,
        PARENT_INDEX : number,
        INDEX : number,
        transform : mat4
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
            tree[i].ApplyOffset( this.transformOffset , tree );
        });

        if(this.meshIndex){

        }
    }

}




class JSON_3DSCENE_SORTER{
    
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
        this.ASSET.materials.forEach(  imat => {
            this._mats[ c ] = this.OperateMaterial(imat) ;
            this.nameMat[ this._mats[c].name() ] = c;
            this._mats[ c ].Index = c++;
            
        });

        c = 0;
        this.ASSET.meshes.forEach(  imesh => {
            var mesh = this.OperateMesh(imesh);
            
            mesh.MaterialIndex = imesh.materialindex;
            mesh.Index = c ;
            mesh.name = imesh.name;
            this.nameMesh[imesh.name] = c;

            this._mats[imesh.materialindex]._meshIndicees.push(c);
            this._meshs[c++] = mesh;
        });

        var arrName : string[] = [];
        asset.animations.forEach(anim => {
            arrName.push(anim.name);
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
                new mat4(c.INODE.transformation)
            );

            // IF MATCHES A MESH LIGHT OR CAMERA OR OTHER; 
            // MESH 
            if(   this.nameMesh[c.INODE.name]   ){
                newNode.meshIndex = newNode.INDEX;
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
    
    /*private  fromQtoV( x:number, y:number, z:number, w:number ): vec3{
        var Q = new Quaternion(x,y,z,w);
        var rtrn : Euler = new Euler();
        rtrn.setFromQuaternion(Q, Euler.DefaultOrder);
        var VECTOR = rtrn.toVector3();
        return new vec3([VECTOR.x , VECTOR.y, VECTOR.z ]);
    }*/
    /*
    private BFL( node : NodeElement, outNode : Node, PARENT : Node = null ,hasRootNode : boolean = false){
            

            // CHECK IF THIS 

            var NewNode : Node;
            var c = 0;

            if(node.children)
            {
                if(  false  ){//! (node.children.length > 1)   ){
                    //this.BFL( node.children[0] , outNode,outNode, true );
                }else{
                    // IS NOT LEAF NODE
                    var que = node.children;
                    c = 0;
                    que.forEach( child => {
                        
                        NewNode = new Node(
                            child.name,
                            new mat4(child.transformation)
                        );

                        NewNode.index = c++;
                        outNode.addChild(NewNode);

                    });
                    for (let i = 0; i < que.length; i++) {
                        this.BFL(que[i], outNode.children[i], outNode,true);
                    }
                    outNode.type=1;
                }
            }else{
                // IS LEAF NODE 
                outNode.type = 2;
                if( outNode.name.includes("Material") )
                    PARENT.children.splice(outNode.index,1); 
                    if(PARENT.children.length == 0)
                        PARENT.children = null;
            }
            
    }*/


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
}

    abstract class AWorld{
        public camPos      = new vec3([-100,0,0]);
        public lookAt      = new vec3([ 0,0,0]);
        public zDirection  = new vec3([ 0,1,0]);

        public worldMatrix  : mat4 = mat4.identity; 
        public viewMatrix   : mat4 = mat4.lookAt( this.camPos, this.lookAt, this.zDirection);
        public projMatrix   : mat4 = mat4.perspective( toRadians(45), ( gl.canvas.width / gl.canvas.height), 0.1,1000 );

        reCalc(camPos:vec3, lookAt:vec3, up:vec3){
            this.viewMatrix   = mat4.lookAt( camPos, lookAt, up);
        }

        constructor(){
        }
        
        getWorldMatrix():  mat4 {
            return this.worldMatrix;
        }
        getViewMatrix():  mat4 {
            return this.viewMatrix;
        }
        getProjectionMatrix(): mat4 {
            return this.projMatrix;
        }

        
        public rotateWorld(angle:number){
            this.worldMatrix.rotate(angle, new vec3([0.5,0.5,1]) );
        }
    }

    export enum WorldMatrixNames{
        World       = "worldMatrix",
        Projection  = "projMatrix",
        View        = "viewMatrix" 
    };

    export var GLOBAL_WORLD:World;
    export class World extends AWorld{

        private MESHES      : Drawable[] = [];
        private MATERIALS   : GLMaterial[];

        private loaded      : boolean = false;

        public bind(): void{
            if(this.loaded)
            this.MATERIALS.forEach( mat => {
                mat.use();
                mat.updateUniform_World(      GLOBAL_WORLD.worldMatrix);
                mat.updateUniform_Camera(     GLOBAL_WORLD.viewMatrix );
                mat.updateUniform_Projection( GLOBAL_WORLD.projMatrix )
                mat.bind();
            });
        }

        public draw(): void {
            if(this.loaded){
                this.bind();
                var counter = 0;
                this.MATERIALS.forEach( mat => {
                    mat.use();
                    mat.bind();
                    mat._meshIndicees.forEach( index => {
                        this.MESHES[index].draw();
                    });
                });
                GLOBAL_WORLD.rotateWorld(0.005)
            }
        }

        public constructor(){
            super();
            GLOBAL_WORLD = this;
            var fr = new FileRequest("resources\\3d\\broken_steampunk_clock\\test.json", this);
        }

        public onFileRecieved( asset : any){
            
            var ASSET : JSON3D = asset.data;        
            var sorter : JSON_3DSCENE_SORTER = new JSON_3DSCENE_SORTER(ASSET);

            
            this.MATERIALS = sorter.getMaterials();

            sorter.getMeshes().forEach( mesh => {
                var draw = new Drawable();
                
                draw.setMesh(mesh, this.MATERIALS[mesh.MaterialIndex] );

                this.MESHES.push(draw );


                //this.NodeTree[0].ApplyOffset( mat4.identity, this.NodeTree );
                //console.log("TREE MADE");
            });

            this.loaded = true;
            /*
            this.reCalc(
                this.camPos,
                new vec3([
                    ASSET.cameras[0].lookat[0],
                    ASSET.cameras[0].lookat[1],
                    ASSET.cameras[0].lookat[2]
                ]),
                new vec3([
                    ASSET.cameras[0].up[0],
                    ASSET.cameras[0].up[1],
                    ASSET.cameras[0].up[2]
                ])
            );


            var length :number = ASSET.meshes.length;
            
            var _meshes : GLMesh[] = [];
            
            for (let i = 0; i < length; i++)
            {
                var mesh = ASSET.meshes[i];
                var faceArr:number[] = [];
                faceArr = [].concat.apply( [] , mesh.faces );

                _meshes.push( new GLMesh(
                    mesh.vertices,
                    mesh.texturecoords[0],
                    faceArr    ,
                    mesh.normals
                ));
            }
            
            this._asset.setMesh(_meshes[0], this._mat);
            
            _meshes.forEach(mesh => {
                this._assets.push(new DefaultCube(this._mat));  
            });

            for (let i = 0; i < _meshes.length; i++) {
                this._assets[i].setMesh(_meshes[i] , this._mat )
            }

            console.log("LENGTH HAS BECOME " + this._assets.length);
            */
        }    
    }

