import { FileRequest, FileRequestBundle } from '../../Loader/FileReuqest';
import { IFileRequestResponse } from "../../Loader/IFileRequestResponse";
import { gl } from "../GL/webGlUtil";

    export class GLTexture{

        private _texture : WebGLTexture = gl.createTexture();
        private _textureType : number ;
        private _clampMethod : number ;
        private _filtrMethod : number ;

        private UintWidth   : number    = 1 ;
        private UintHeight  : number    = 1 ;

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

        private isUint : boolean = false;
        private source : any;
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

        }

        public bind( GL_TEXTURE_ID : number =  gl.TEXTURE0 ){
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
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(this._textureType, null);
        }


        public static createCheckers( boxes : number = 8) : GLTexture {
            
            function createLine( startWhite : boolean) : number[] {
                
                var arr : number [] = [];
                var bool : boolean = startWhite;
                var curr  : number = 0;

                for (let a = 0; a < 8; a++) {
                    
                    if(bool){
                        curr = 255;
                    }else{
                        curr = 0;
                    }

                    for (let i = 0; i < 8; i++) {
                        arr.push(curr); // red 
                        arr.push(curr); // green
                        arr.push(curr); // blue 
                        arr.push(255); // alpha 
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
            var texture = new GLTexture();
            texture.load_uintImage(uint, 64, 64);
            return texture;
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
    

    export class CubeMapTexture implements IFileRequestResponse{

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
        private _clampMethod : number ;
        private _filtrMethod : number ;


        //private UintWidth   : number = 1;
        //private UintHeight  : number = 1;
        private loaded :boolean = false;

        public constructor(
            clampMethod : number =  gl.CLAMP_TO_EDGE ,
            filterMethod:number = gl.LINEAR
        ){

            this._clampMethod = clampMethod;
            this._filtrMethod = filterMethod;
            
            this.requests.push(this.a1);
            this.requests.push(this.a2);
            this.requests.push(this.a3);
            this.requests.push(this.a4);
            this.requests.push(this.a5);
            this.requests.push(this.a6);
            this.requests.push(this.a7);
            this.requests.push(this.a8);
            this.requests.push(this.a9);
            this.requestImage();

            this.texture = gl.createTexture();
            
        }
        public bind( ){
            gl.bindTexture(   gl.TEXTURE_CUBE_MAP, this.texture);
        }

        private LoadTexture(){
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

                this.loaded = true;

            gl.bindTexture(gl.TEXTURE_CUBE_MAP,null);
            return this.texture;
        }

        public onFileRecieved(asset: any[] ) {

            for (let i = 0; i < asset.length; i++) {
                this.images.push( asset[i].data )
            }
            this.LoadTexture();
            console.log("RECIEVED STUFF ");
        }

        private requestImage(){
            var fr : FileRequestBundle = new FileRequestBundle(this.requests, this);
        }

        public changeFilter(filterMethod:number = gl.LINEAR){
            this._filtrMethod = filterMethod;
            this.LoadTexture();
        }
        public changeClamp(clampMethod : number =  gl.CLAMP_TO_EDGE ){
            this._clampMethod = clampMethod;
            this.LoadTexture();
        }


    }
