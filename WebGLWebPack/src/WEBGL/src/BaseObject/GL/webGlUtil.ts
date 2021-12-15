    export var gl: WebGLRenderingContext;

    export class WebGLUtil {
        // SOURCE https://www.youtube.com/watch?v=q7_6CSf5HlI
        /**
         * Initializes WebGl and Gl Variable. also creates a reference to a Canvas element,either by id or create a new one. 
         * @param idName
         */
        public static initialize(idName?: string): HTMLCanvasElement {

            let canvas: HTMLCanvasElement;
            if (idName !== undefined) {
                canvas = document.getElementById(idName) as HTMLCanvasElement;
                if (canvas === undefined) { throw new Error("Could not find Canvas element of Id " + idName); }
            } else {
                canvas = document.createElement("canvas") as HTMLCanvasElement;
                document.body.appendChild(canvas);
            }

            gl = canvas.getContext("webgl");
            if (gl === undefined) {
                throw new Error("Unable to initialize WebGL");
            }
            gl.enable(gl.DEPTH_TEST);
            gl.depthMask( true );
            gl.disable(gl.BLEND);
            
            return canvas;
        }
    }
