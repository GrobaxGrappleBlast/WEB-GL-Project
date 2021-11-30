// source https://www.youtube.com/watch?v=lbnr1gGmSMA

import { gl } from "./webGlUtil";

    
    export class UniformInfo {
        public name: string;
        public location: WebGLUniformLocation;
        public data: Float32Array;
    }

    export class AttributeInfo {
        public location: number;
        public size: number;
        public offset: number;

        public constructor(
            location: number = 0,
            size: number = 0,
            offset: number = 0
        ){
            this.location = location;
            this.size = size;
            this.offset = offset;
        }

    }

    export class GLBuffer {

        // ATTRIBUTES 
        private _hasAttributelocation: boolean = false;
        private _attributes: AttributeInfo[] = [];
        
        // UNIFORMS 
        private _hasUniformlocation:boolean = false;
        private _uniforms:UniformInfo[] = [];

        private _numElementsPerVertex: number;
        private _VertexSize: number;
        private _buffer: WebGLBuffer;

        private _targerBufferType: number;
        private _dataType: number;
        private _mode: number;
        private _typeSize: number;

        private _data: number[] = [];

        public constructor(
            elementSize: number,
            dataType: number = gl.FLOAT,
            targerBufferType: number = gl.ARRAY_BUFFER,
            mode: number = gl.TRIANGLES
        ){
            this._numElementsPerVertex = elementSize;
            this._dataType = dataType;
            this._targerBufferType = targerBufferType;
            this._mode = mode;

            // Byte Size
            switch (this._dataType) {
                case gl.FLOAT:
                case gl.INT:
                case gl.UNSIGNED_INT:
                    this._typeSize = 4;
                    break;
                case gl.SHORT:
                case gl.UNSIGNED_SHORT:
                    this._typeSize = 2;
                    break;
                case gl.BYTE:
                    this._typeSize = 1;
                    break;
                default:
                    throw new Error("Unrecognised data type " + this._dataType.toString());
            }

            this._VertexSize = this._numElementsPerVertex * this._typeSize;
            this._buffer = gl.createBuffer();
        }

        public destroy() {
            gl.deleteBuffer(this._buffer);
        }

        public bind(normalized: boolean = false ) {

            gl.bindBuffer(this._targerBufferType, this._buffer);

            if (this._hasAttributelocation) {
                for (let i = 0; i < this._attributes.length; i++) {
                   let a =  this._attributes[i];
                    // the notes below references an "array" this is the data given to the Vertecies,                     
                    gl.vertexAttribPointer(
                        a.location,                 // Where the Attribute we want to change is.
                        a.size,                     // the Number of Components Per a single vertex
                        this._dataType,             // what type of Data is a single component
                        normalized,                 // should the data be fitted into a certain range between 1 and 0 
                        this._VertexSize,           // How many elements to skip? between noteS?!!       
                        a.offset * this._typeSize   // this is how far into the Array ( in bytes) we need to look for the start of this data entry
                    );
                    gl.enableVertexAttribArray(a.location);
                }
            }

            if (this._hasUniformlocation) {
                for (let i = 0; i < this._uniforms.length; i++) {
                   gl.uniformMatrix4fv(
                        this._uniforms[i].location,
                       false,
                       this._uniforms[i].data
                   );
                }
            }

        }

        public unbind(): void {
            if (this._hasAttributelocation) {
                for (let i = 0; i < this._attributes.length; i++) {
                    gl.disableVertexAttribArray(
                        this._attributes[i].location
                    );
                }
            }
            gl.bindBuffer(this._targerBufferType, this._buffer)
        }

        public addAttribute(data: AttributeInfo):void{
            this._hasAttributelocation = true;
            this._attributes.push(data);
        }

        public addUniformM4(data: UniformInfo):void{
            this._hasUniformlocation = true;
            this._uniforms.push(data);
        }

        public pushData(data: number[]) {
            for (let i = 0; i < data.length; i++) {
                this._data.push(data[i]);
            }
        }

        public setData(data:number[]){
            this._data =[];
            this.pushData(data);
        }

        public upload() {        
           
            let bufferData: ArrayBuffer;
            switch (this._dataType) {
                case gl.FLOAT:
                    bufferData = new Float32Array(this._data);
                    break;
                case gl.INT:
                    bufferData = new Int32Array(this._data);
                    break;
                case gl.UNSIGNED_INT:
                    bufferData = new Uint32Array(this._data);
                    break;
                case gl.SHORT:
                    bufferData = new Int16Array(this._data);
                    break;
                case gl.UNSIGNED_SHORT:
                    bufferData = new Uint16Array(this._data);
                    break;
                case gl.BYTE:
                    bufferData = new Int8Array(this._data);
                    break;
                case gl.UNSIGNED_BYTE:
                    bufferData = new Uint8Array(this._data);
                    break;
                default:
                    throw new Error("Unrecognised data type in System failed. " + this._dataType.toString());
            }

            gl.bufferData(
                this._targerBufferType,
                bufferData,
                gl.STATIC_DRAW
            );        
        }

        public draw(): void {
            if (this._targerBufferType === gl.ARRAY_BUFFER) {
                gl.drawArrays(this._mode, 0, this._data.length / this._numElementsPerVertex);
            } else if (this._targerBufferType === gl.ELEMENT_ARRAY_BUFFER) {
                gl.drawElements(this._mode, this._data.length,this._dataType, 0);
            }
        }
    }

