import { GLMaterial } from './Components/GLMaterial';
import { LoadableTexture } from './Components/GLTexture';
import { Drawable } from './Drawable';
import { GLOBAL_WORLD } from '../World/World';
import { vec3 } from '../Math/TSM_Library/vec3';

export class DrawableObject{

    public location : vec3;
    public rotation : vec3;
    public scale    : vec3;

    private _assets : Drawable[] = [];
    private _mat    :GLMaterial;
    
    public constructor(){
        this._mat = new GLMaterial(
            "default",
            new LoadableTexture("resources\\3d\\broken_steampunk_clock\\textures\\Material_3_baseColor.png"),
            new LoadableTexture("resources\\3d\\broken_steampunk_clock\\textures\\Material_3_emissive.png"),
            new LoadableTexture("resources\\3d\\broken_steampunk_clock\\textures\\Material_3_baseColor.png")
        );
       
    }

    public bind(): void{
        this._mat.use();
        this._mat.updateUniform_World(      GLOBAL_WORLD.worldMatrix);
        this._mat.updateUniform_Camera(     GLOBAL_WORLD.viewMatrix );
        this._mat.updateUniform_Projection( GLOBAL_WORLD.projMatrix )
        this._mat.bind();
    }

    public draw(): void {
        this.bind();
        this._assets.forEach(a => {
            a.draw();
        });
        GLOBAL_WORLD.rotateWorld(0.005)
    }

}