import { GLShader } from './BaseObject/GL/GLShader';
import { GLMaterial, GLAMaterial } from './BaseObject/Components/GLMaterial';
import { GLShadowTexture, GLTexture } from './BaseObject/Components/GLTexture';
import { GLMesh } from './BaseObject/Components/GLMesh';



export var context;

export class CONTEXT{

    public constructor(){
        context = this;
    }

    public MESHES      : GLMesh[]    = [];
    public MATERIALS   : GLAMaterial[]      = [];

    public currentShader   :GLShader;
    public currentMaterial :number;

    public ShadowTexture : GLShadowTexture;
    public TEXTURES    : GLTexture[] = [];

    bindMesh(){

    }
    bindTextures(){

    }
    bindMaterial(){

    }
    bindShader(){

    }
    bindLight(){

    }
}