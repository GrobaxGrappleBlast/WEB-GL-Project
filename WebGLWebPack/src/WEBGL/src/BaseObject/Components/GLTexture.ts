import { FileRequest, FileRequestBundle } from '../../Loader/FileReuqest';
import { IFileRequestResponse } from "../../Loader/IFileRequestResponse";
import { gl } from "../GL/webGlUtil";
import { CONTEXT } from '../../Context';
import { GLShader } from '../GL/GLShader';
import { Color } from 'three';

export interface ITexture{

    loadtexture();
    bind( GL_TEXTURE_ID : number );
    unBind();
    loadImage(source: any);
    load_uintImage(source: Uint8Array , uWidth : number, uHeight : number )
    changeFilter(filterMethod:number);
    changeClamp(clampMethod : number );
}

    export class GLColor{
        public r :number ;
        public g :number ;
        public b :number ;
        public a :number ;
        public constructor(r :number,g :number,b :number,a :number){
            this.r = r ; 
            this.g = g ; 
            this.b = b ; 
            this.a = a ; 
        }

    }
    export abstract class GLTexture implements ITexture{

        public name : string; 
        public isLoaded : boolean = false;
        private _texture : WebGLTexture = gl.createTexture();
        private _textureType : number ;

        private UintWidth   : number    = 1 ;
        private UintHeight  : number    = 1 ;
        
        public _clampMethod : number ;
        public _filtrMethod : number ;

        public constructor(
            textureType : number = gl.TEXTURE_2D,
            clampMethod : number =  gl.CLAMP_TO_EDGE ,
            filterMethod:number = gl.LINEAR
        ){
            this._textureType = textureType;
            this._clampMethod = clampMethod;
            this._filtrMethod = filterMethod;
        }

        public changeFilter(filterMethod:number = gl.LINEAR){
            this._filtrMethod = filterMethod;
            this.loadtexture();
        }
        public changeClamp(clampMethod : number =  gl.CLAMP_TO_EDGE ){
            this._clampMethod = clampMethod;
            this.loadtexture();
        }

        public isUint : boolean = false;
        public source : any;
        public loadtexture(){
            
            this.bind();
            gl.texParameteri( this._textureType , gl.TEXTURE_WRAP_S     , this._clampMethod );
            gl.texParameteri( this._textureType , gl.TEXTURE_WRAP_T     , this._clampMethod );
            gl.texParameteri( this._textureType , gl.TEXTURE_MIN_FILTER , this._filtrMethod);
            gl.texParameteri( this._textureType , gl.TEXTURE_MAG_FILTER , this._filtrMethod);

            if(this.isUint){
                gl.texImage2D( 
                    gl.TEXTURE_2D   ,
                    0               , 
                    gl.RGBA         ,    
                    this.UintWidth  ,    
                    this.UintHeight ,      
                    0               , 
                    gl.RGBA         , 
                    gl.UNSIGNED_BYTE, 
                    this.source           
                );
            }else{
                //texImage2D(target: GLenum, level: GLint, internalformat: GLint, format: GLenum, type: GLenum, source: TexImageSource): void;
                gl.texImage2D(
                    gl.TEXTURE_2D,
                    0,
                    gl.RGBA,gl.RGBA,
                    gl.UNSIGNED_BYTE,
                    this.source
                );
            }
            this.isLoaded = true;

        }
        
        public THIS_GL_TEXTURE_ID:number;

        public bind( GL_TEXTURE_ID : number =  gl.TEXTURE0 ){
            this.THIS_GL_TEXTURE_ID = GL_TEXTURE_ID;
            gl.activeTexture(  GL_TEXTURE_ID );
            gl.bindTexture(   gl.TEXTURE_2D, this._texture);
        }

        public loadImage(source: TexImageSource){
            this.isUint = false;
            this.source = source;
            this.loadtexture();
        }

        public load_uintImage(source: Uint8Array, uWidth : number = 1, uHeight : number = 1){
            this.UintWidth = uWidth;
            this.UintHeight= uHeight;
            this.isUint = true;
            this.source = source;
            this.loadtexture();
        }
        
        public unBind(){
            gl.activeTexture(this.THIS_GL_TEXTURE_ID);
            gl.bindTexture(this._textureType, null);
        }
    }

    export class CheckerTexture extends GLTexture{

        public constructor( name : string , boxes : number = 8, height:number = 64, width:number=64, color1 : GLColor = new GLColor(255,55,55,255) , color2 : GLColor =  new GLColor(55,55,55,255) ){
            super();

            this.name = name
            function createLine( startWhite : boolean) : number[] {
                
                var arr : number [] = [];
                var bool : boolean = startWhite;
                var curr  : GLColor;

                for (let a = 0; a < 8; a++) {
                    
                    if(bool){
                        curr = color1;
                    }else{
                        curr = color2;
                    }

                    for (let i = 0; i < 8; i++) {
                        arr.push(curr.r); // red 
                        arr.push(curr.g); // green
                        arr.push(curr.b); // blue 
                        arr.push(curr.a); // alpha 
                    }

                    bool = !bool;
                }
                return arr;
            }

            var arr : number [] = [];
            var whiteLine : boolean = true;
            for (let i = 0; i < 8; i++) {
                for (let a = 0; a < 8; a++) {
                    createLine(whiteLine).forEach( n => {
                        arr.push( n );
                    });
                }
                whiteLine = !whiteLine;
            }

            var uint = new Uint8Array( arr );         
            this.load_uintImage(uint, 64, 64);

        }

          
    }


    export class COLORSTDTexture extends GLTexture {

        public constructor( r : number = 0, g : number = 0,b : number = 0 , a : number = 255){
            super();
            this.tex(r,g,b,a);
        }

        public tex(r : number = 0, g : number = 0,b : number = 0, a : number = 255) : void {
            var A : Uint8Array = new Uint8Array(4);  
                A[0] = (r); // red 
                A[1] = (g); // green
                A[2] = (b); // blue 
                A[3] = (a); // alpha 
            
            this.name = "[r"+A[0] +",g"+A[1] +",b"+A[2] +",a"+A[3]+"]";
            this.load_uintImage(A,1,1)
        }

    }
    
    export class LoadableTexture extends GLTexture implements IFileRequestResponse{
        
        private _request;

        public constructor(
            requestFile : string,
            textureType : number = gl.TEXTURE_2D,
            clampMethod : number = gl.CLAMP_TO_EDGE ,
            filterMethod: number = gl.LINEAR
        ){
            super(textureType ,clampMethod ,filterMethod)
            this.name = requestFile;
            this._request = requestFile;

       
            this.load_uintImage(
                new Uint8Array( [255,255,255,255] ));
            this.requestImage();
        }

        public reload(requests):void{
            this._request = requests;
            this.requestImage();
        }

        public onFileRecieved( asset : any){
            this.loadImage( asset.data as TexImageSource);
        }

        private requestImage(){
            var fr : FileRequest = new FileRequest(this._request, this);
        }

    }
    
    export class CubeMapTexture extends GLTexture implements IFileRequestResponse, ITexture{

        private a1 = "resources\\images\\cm_back.png   "     ;
        private a2 = "resources\\images\\cm_bottom.png "     ;
        private a3 = "resources\\images\\cm_front.png  "     ;
        private a4 = "resources\\images\\cm_left.png   "     ;
        private a5 = "resources\\images\\cm_right.png  "     ;
        private a6 = "resources\\images\\cm_top.png    "     ;
        private a7 = "resources\\images\\normalmap.png "     ;
        private a8 = "resources\\images\\RTS_Crate.jpg "     ;
        private a9 = "resources\\images\\RTS_Crate.png "     ;

        private requests: string[] = [] ;

        private texture : WebGLTexture;
        private images  : TexImageSource[] = [];

        public constructor(
            requests        : string[] ,
            clampMethod     : number    = gl.CLAMP_TO_EDGE  ,
            filterMethod    : number    = gl.LINEAR         ,
        ){
            super( undefined ,clampMethod, filterMethod);
            this.name = requests[0];
            var i = 0;
            this.requests.push(requests[i++]);
            this.requests.push(requests[i++]);
            this.requests.push(requests[i++]);
            this.requests.push(requests[i++]);
            this.requests.push(requests[i++]);
            this.requests.push(requests[i++]);

            this.requestImage();
            this.texture = gl.createTexture();
        }

        override loadImage( source:TexImageSource ) {
            //throw new Error('Method not implemented.');
        }
        override load_uintImage(source: Uint8Array, uWidth: number, uHeight: number) {
            //throw new Error('Method not implemented.');
        }
        override loadtexture(){
            this.texture = gl.createTexture();
            gl.bindTexture(   gl.TEXTURE_CUBE_MAP, this.texture);
    
            for(var i=0; i < 6; i++)
                gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X + i, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.images[i] );
            
            gl.generateMipmap( gl.TEXTURE_CUBE_MAP);
            gl.texParameteri(  gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR)
    
            gl.texParameteri(  gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, this._filtrMethod);	//Setup up scaling
            gl.texParameteri(  gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, this._filtrMethod);	//Setup down scaling
            gl.texParameteri(  gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S,     this._clampMethod);	//Stretch image to X position
            gl.texParameteri(  gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T,     this._clampMethod);	//Stretch image to Y position
            gl.generateMipmap( gl.TEXTURE_CUBE_MAP  );

        gl.bindTexture(gl.TEXTURE_CUBE_MAP,null);
        return this.texture;
        }


        override bind( GL_TEXTURE_ID : number = gl.TEXTURE0 ){
            this.THIS_GL_TEXTURE_ID = GL_TEXTURE_ID;
            gl.activeTexture(  GL_TEXTURE_ID );
            gl.bindTexture(   gl.TEXTURE_CUBE_MAP, this.texture);
        }
        override unBind(){
            gl.activeTexture(this.THIS_GL_TEXTURE_ID);
            gl.bindTexture(gl.TEXTURE_CUBE_MAP, null);
        }

        // ## --- --- --- ## --- --- --- ## --- --- --- ## --- --- --- FILE REQUESTS 
        public onFileRecieved(asset: any[] ) {

            for (let i = 0; i < asset.length; i++) {
                this.images.push( asset[i].data )
            }
            this.loadtexture();
        }

        private requestImage(){
            var fr : FileRequestBundle = new FileRequestBundle(this.requests, this);
        }




    }

    export class GLShadowTexture extends GLTexture implements ITexture{

        public constructor(
            clampMethod : number =  gl.CLAMP_TO_EDGE ,
            filterMethod:number = gl.LINEAR
        ){
            super();
            this.name = "shadow";
            this._clampMethod = clampMethod;
            this._filtrMethod = filterMethod;
        }

        override load_uintImage(source: Uint8Array, uWidth: number, uHeight: number) {}
        override loadImage(source: TexImageSource){}
        override loadtexture(){}

        public bind( GL_TEXTURE_ID : number = gl.TEXTURE0 ){
            this.THIS_GL_TEXTURE_ID = GL_TEXTURE_ID;
            gl.activeTexture(  GL_TEXTURE_ID );
            gl.bindTexture(   gl.TEXTURE_CUBE_MAP, CONTEXT.ShadowTexture);
        }

        public unBind(){
            gl.activeTexture(this.THIS_GL_TEXTURE_ID);
            gl.bindTexture(gl.TEXTURE_CUBE_MAP, null);
        }

    }
