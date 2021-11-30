import { FileRequest } from "./../../Loader/FileReuqest";
import { IFileRequestResponse } from "./../../Loader/IFileRequestResponse";
import { gl } from "../GL/webGlUtil";

    export class Texture{

        private _texture : WebGLTexture = gl.createTexture();
        private _textureType : number ;
        private _clampMethod : number ;
        private _filtrMethod : number ;

        public constructor(
            textureType : number = gl.TEXTURE_2D,
            clampMethod : number =  gl.CLAMP_TO_EDGE ,
            filterMethod:number = gl.LINEAR
        ){
            this._textureType = textureType;
            this._clampMethod = clampMethod;
            this._filtrMethod = filterMethod;
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
                    gl.TEXTURE_2D,
                    0, 
                    gl.RGBA,
                    1,
                    1,
                    0,
                    gl.RGBA, 
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

        public load_uintImage(source: Uint8Array){
            this.isUint = true;
            this.source = source;
            this.loadtexture();
        }
        
        public unBind(){
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(this._textureType, null);
        }
    }

    
    export class LoadableTexture extends Texture implements IFileRequestResponse{
        
        private _request;

        public constructor(
            requestFile : string,
            textureType : number = gl.TEXTURE_2D,
            clampMethod : number = gl.CLAMP_TO_EDGE ,
            filterMethod: number = gl.LINEAR
        ){
            super(textureType ,clampMethod ,filterMethod)
            this._request = requestFile;
            this.load_uintImage(new Uint8Array([255,255,255,255]));
            this.requestImage();
        }

        public reload(requests):void{
            this._request = requests;
        }

        public onFileRecieved( asset : any){
            this.loadImage( asset.data as TexImageSource);
        }

        private requestImage(){
            var fr : FileRequest = new FileRequest(this._request, this);
        }

    }
    
