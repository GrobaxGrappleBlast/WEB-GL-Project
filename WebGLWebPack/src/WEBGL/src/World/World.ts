import { gl } from "./../BaseObject/GL/webGlUtil";
import { IDrawable } from "./../BaseObject/IDrawable";
import { toRadians } from "./../Math/TSM_Library/constants";
import { mat4 } from "./../Math/TSM_Library/mat4";
import { vec3 } from "./../Math/TSM_Library/vec3";
import { FileRequest } from '../Loader/FileReuqest';
import { JSON3D } from "../Loader/Assets/Loaders/JSONAssetLoader";
import { Mesh } from '../BaseObject/Components/Mesh';
import { Drawable, DefaultCube } from '../BaseObject/Drawable';
import { DefaultShader, Shader } from '../BaseObject/GL/Shader';
import { Texture, LoadableTexture } from '../BaseObject/Components/Texture';
import { Material } from '../BaseObject/Components/Material';

   /*

    export class Quaternion {
        public w : number;
        public x : number;
        public y : number;
        public z : number;
        public constructor(){}
    };

    export class EulerAngles {
        public roll : number;
        public pitch: number;
        public yaw: number;
        public constructor(){}
    };

    export function ToEulerAngles(q:Quaternion):EulerAngles {
        var angles: EulerAngles = new EulerAngles();

        // roll (x-axis rotation)
        var sinr_cosp = 2 * (q.w * q.x + q.y * q.z);
        var cosr_cosp = 1 - 2 * (q.x * q.x + q.y * q.y);
        angles.roll = std::atan2(sinr_cosp, cosr_cosp);

        // pitch (y-axis rotation)
        var sinp = 2 * (q.w * q.y - q.z * q.x);
        if (std::abs(sinp) >= 1)
            angles.pitch = std::copysign(M_PI / 2, sinp); // use 90 degrees if out of range
        else
            angles.pitch = std::asin(sinp);

        // yaw (z-axis rotation)
        var siny_cosp = 2 * (q.w * q.z + q.x * q.y);
        var cosy_cosp = 1 - 2 * (q.y * q.y + q.z * q.z);
        angles.yaw = std::atan2(siny_cosp, cosy_cosp);

        return angles;
    }*/

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

        private _assets : Drawable[] = [];
        private _asset : Drawable;
        //private _shader : Shader;
        private _mat : Material;
        //public _tex : Texture; 

        public bind(): void{

            this._mat.use();
            this._mat.updateUniform_World(      GLOBAL_WORLD.worldMatrix);
            this._mat.updateUniform_Camera(     GLOBAL_WORLD.viewMatrix );
            this._mat.updateUniform_Projection( GLOBAL_WORLD.projMatrix )
            this._mat.bind();
           // this._shader.use();
            //gl.uniformMatrix4fv(this._shader.getUniformLocation("worldMatrix"), false, GLOBAL_WORLD.worldMatrix.values );
            //gl.uniformMatrix4fv(this._shader.getUniformLocation("viewMatrix") , false, GLOBAL_WORLD.viewMatrix.values  );
            //gl.uniformMatrix4fv(this._shader.getUniformLocation("projMatrix") , false, GLOBAL_WORLD.projMatrix.values  );
            //this._tex.bind();
        }

        // # DRAWABLE IMPLEMENTATION 
        public draw(): void {
            this.bind();
            this._assets.forEach(a => {
                a.draw();
            });
           //this._asset.draw();
            GLOBAL_WORLD.rotateWorld(0.005)
        }

        public constructor(){
            super();
            this._mat = new Material(
                "default",
                new LoadableTexture("resources\\3d\\broken_steampunk_clock\\textures\\Material_3_baseColor.png"),
                new LoadableTexture("resources\\3d\\broken_steampunk_clock\\textures\\Material_3_emissive.png"),
              //  new LoadableTexture("resources\\3d\\broken_steampunk_clock\\textures\\Material_3_baseColor.png")
            );
            GLOBAL_WORLD = this;
            //this._assets = [];
            //this._shader = new DefaultShader("default");
            this._asset = new DefaultCube( this._mat);
            
            //this._tex = new LoadableTexture("resources\\3d\\broken_steampunk_clock\\textures\\Material_3_baseColor.png");
            var fr = new FileRequest("resources\\3d\\broken_steampunk_clock\\test.json", this);
        }

        public onFileRecieved( asset : any){
            

            console.log("ON FILE RECIEVED ");
            var ASSET : JSON3D = asset.data;        
                    
            
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
            
            var _meshes : Mesh[] = [];
            
            for (let i = 0; i < length; i++)
            {
                var mesh = ASSET.meshes[i];
                var faceArr:number[] = [];
                faceArr = [].concat.apply( [] , mesh.faces );

                _meshes.push( new Mesh(
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
            
        }    
    }

