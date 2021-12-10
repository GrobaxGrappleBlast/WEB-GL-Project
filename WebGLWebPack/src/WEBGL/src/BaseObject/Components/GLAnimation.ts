
import { Animation, JSON_3DSCENE_SORTER } from '../../Loader/Assets/Loaders/JSONAssetLoader';
import { HashArray } from '../HashArray';
import { GLOBAL_WORLD } from '../../World/World';
import { mat4 } from '../../Math/TSM_Library/mat4';
import { vec3 } from '../../Math/TSM_Library/vec3';
import { vec4 } from '../../Math/TSM_Library/vec4';
import { Quaternion } from 'three';
import { MATH } from '../../Math/general';

function leastInteger( arr : number[] ): number{
    var rtr : number = arr[0];
    for (let i = 1; i < arr.length; i++) {
        if( rtr > arr[i] )
            rtr = arr[i];
    }
    return rtr;
}

function highestInteger( arr : number[] ): number{
    var rtr : number = arr[0];
    for (let i = 1; i < arr.length; i++) {
        if( rtr < arr[i] )
            rtr = arr[i];
    }
    return rtr;
}

export class GLAnimationChannel{
    
    public start:number = Number.MAX_SAFE_INTEGER;
    public end:number   = 0;
    public keys :{ [frame : number] : number[] }  = {};

    public add( key:number[] , index : number){

        if(index < this.start )
            this.start  = index ;
        
        if(index > this.start )
            this.end    = index   ;
        
        this.keys[index] = key;
    }

    public getFrame(frame:number) : number[] {
        if(frame < this.start)
            return this.keys[this.start];

        if(frame > this.end)
            return this.keys[this.end];

        return this.keys[frame];
    }

    public interpolateMissing(){
        
        var undefList   : number[] = [];
        var defList     : number[] = [];

        // FINDING HOLES 
        for (let i = this.start; i < this.end; i++) {
            // FIND AN UNDEFINED
            
            if( this.keys[i] == undefined ){
                undefList.push(i);
            
                while(true){
                    // FIND A DEFINED INDEX
                    i++;
                    
                    if(this.keys[i] != undefined){
                        defList.push(i);
                        break;
                    }
                }
            }
        }

        function add( arr1 : number[], arr2 : number[] , factor : number = 1 ): number[] {
            if(factor == 0)
                return arr1;

            var arr3 :number[] = [];
            for (let a = 0; a < arr1.length; a++) {
                arr3.push( arr1[a] + ( arr2[a] * factor) );
            }
            return arr3;
        }
        function sub( arr1 : number[], arr2 : number[] ){
            var arr3 :number[] = [];
            for (let a = 0; a < arr1.length; a++) {
                arr3.push( arr1[a] - arr2[a] );
            }
            return arr3;
        }
        function dev( arr:number[], factor:number){
            if(factor == 0)
                return arr;
            for (let i = 0; i < arr.length; i++) {
                arr[i] = arr[i] / factor;
            }
            return arr;
        }

        // FIXING HOLES PAIR WISE;
        for (let i = 0; i < undefList.length; i++) {


            var Next = defList[i];
            //if(Next == undefined)
            //    Next = this.end;

            var prevVal = this.keys[undefList[i]-1];
            var lastVAL = this.keys[Next];
            
            // calc increase pr step 
            var increase = sub(prevVal, lastVAL);
            increase = dev(increase, ( defList[i] - Next ) )

            for (let a = undefList[i]; a < Next ; a++) {
                this.keys[a] =  add( prevVal , increase , a );
            }
        
        }


    }

}

export class GLAnimationTarget{
    
    targetIndex: number;
    private readonly channelPosition : GLAnimationChannel; 
    private readonly channelRotation : GLAnimationChannel; 
    private readonly channelScaling  : GLAnimationChannel;

    private start   :number = Number.MAX_SAFE_INTEGER;
    private end     :number = 0;

    public constructor(position:GLAnimationChannel, rotation:GLAnimationChannel, scale : GLAnimationChannel){
        this.channelPosition = position     ;
        this.channelRotation = rotation     ;
        this.channelScaling  = scale        ;

        this.start  = leastInteger( [    this.channelPosition.start  , this.channelRotation.start    , this.channelScaling.start ] );
        this.end    = highestInteger( [    this.channelPosition.end    , this.channelRotation.end      , this.channelScaling.end   ] );
    }

    public getStart(){
        return this.start;
    }

    public getEnd(){
        return this.end;
    }

    private oldPOS = new vec3([0,0,0]);
    private oldROT = new vec3([0,0,0]);
    private oldSCA = new vec3([0,0,0]);
    

    public playKeyframe(frame : number ){

        var transform :mat4 = ( new mat4() ).setIdentity();
        var data : number[];

        data = this.channelRotation.getFrame(frame);
        //var vecROT = new vec3([0.0,1.0,0.0]);
        var vecROT = MATH.fromQtoV( 
            data[   1   ],   
            data[   2   ],
            data[   3   ], 
            data[   0   ] 
        ); 
        
       

        // ( data[1]    ,   data[2] ,   data[0], data[3] );  == X AXIS 
        data = this.channelPosition.getFrame(frame);
        var vecPOS  = new vec3([data[0]    ,   data[1] ,   data[2]]);
       
        data = this.channelScaling.getFrame(frame);
        var vecSCA  = new vec3([data[0]    ,   data[1] ,   data[2]]);

        vecPOS = this.oldPOS.subtract(vecPOS);
        vecROT = this.oldROT.subtract(vecROT);
        vecSCA = this.oldSCA.subtract(vecSCA);

        this.oldPOS = vecPOS; 
        this.oldROT = vecROT; 
        this.oldSCA = vecSCA; 
        
        transform = transform.translate( vecPOS ); 
        
        if(vecROT.length() != 0)
            transform = transform.rotate( (vecROT.length()/5) ,  vecROT );

        //transform = transform.scale( vecSCA );
        var a : mat4 = mat4.getIdentity().multiply(
            GLOBAL_WORLD.NodeTree[this.targetIndex].startTransform
        ).multiply(
            transform
        );

        GLOBAL_WORLD.NodeTree[this.targetIndex].ApplyOffset(a.inverse() , mat4.getIdentity() ,  GLOBAL_WORLD.NodeTree );
    
    }
}

export class GLAnimation{

    private targets : GLAnimationTarget[] = [];
    
    private start: number = Number.MAX_SAFE_INTEGER;
    private end  : number = 0;

    public constructor(){
       
    }

    public playKeyFrame( frame : number ){
        this.targets.forEach( (target, i ) => {
            target.playKeyframe( frame );
        });
    }

    public getStart():number{
        return this.start;
    }

    public getEnd():number{
        return this.end;
    }

    public addChannel(target : GLAnimationTarget ){

        if( this.start > target.getStart() )
            this.start = target.getStart();
            
        if( this.end < target.getEnd() )
            this.end = target.getEnd();
        
        this.targets.push(target);
    }


}

export class GLAnimationBundle{
    
    private Animations : HashArray<GLAnimation>;
  
    public constructor (anims : Animation[] , sorter : JSON_3DSCENE_SORTER ){
    
        this.Animations = new HashArray<GLAnimation>();
        
        // OBJECTIVE : GENERATE AN GLANIMATION FOR EACH ANIMATION
        // THE GLANIMATIONS ARE GATHERED A BIT DIFFERENT SO SORT THEM TO. 
        // SO ALSO IN THE FOREACH ALSO CHECK IF THE ANIMATION ALREADY EXISTS , IF IT DOES ADD THE ANIMATION DATA TO THE DATA. 
    
        anims.forEach( (anim, animIndex) => {

            var str = anim.name.split("::");
            str = str[1].split("_");

            // STR[0] = animation Name  ;
            // STR[1] = animationTarget ;

            if(     sorter.hasNode( str[1] )   ){
                
                // ENSURE THE ANIMATION EXISTS 
                if(     ! this.Animations.hasIndex( str[0] )  ) // DOES NOT ALREADY EXISTS 
                    this.Animations.add( new GLAnimation() , str[0] ); // THEN CREATE A NEW;

                // NEXT OBJECTIVE, THE ANIMS WE GET IN ARENT SEPERATED, THEY HAVE THE SAME NAME FOR MULTIPLE PARTS OF THE SAME ANIMATON.
                //  ==  EACH INPUT ANIM HAS CHANNELS FOR ONLY ONE ASPECT OF THE ANIMATION
                // SO WE CREATE A GLAnimationTarget for this anim, and add that to the GLAnimation. 
                
                // CREATE THE CHANNEL  // we need a first, for each channel in case the first keyframe, isent on frame 0;
                anim.channels.forEach( (channel , channel_Index ) => {
                    
                    var GLAnim   : GLAnimationTarget    ; 

                    var CHAN_POS : GLAnimationChannel =  new GLAnimationChannel();
                    var CHAN_ROT : GLAnimationChannel =  new GLAnimationChannel();
                    var CHAN_SCAL: GLAnimationChannel =  new GLAnimationChannel();

                    // POSITION
                    channel.positionkeys.forEach( (frame, frameIndex ) => {
                        //FRAME = frame[0] as number;
                        //KEYS  = frame[1] as number[];
                        var a = frame[0] as number;
                        var b = frame[1] as number[];
                        CHAN_POS.add(
                            frame[1] as number[],
                            frame[0] as number
                        );

                    });

                    // ROTATION
                    channel.rotationkeys.forEach( frame => {
                        //INDEX = frame[0] as number;
                        //KEYS  = frame[1] as number[];
                        var a = frame[0] as number;
                        var b = frame[1] as number[];
                        CHAN_ROT.add(
                            frame[1] as number[],
                            frame[0] as number
                        );
                    });

                    // SCALE 
                    channel.scalingkeys.forEach(  frame => {
                        //INDEX = frame[0] as number;
                        //KEYS  = frame[1] as number[];
                        var a = frame[0] as number;
                        var b = frame[1] as number[];
                        CHAN_SCAL.add(
                            frame[1] as number[],
                            frame[0] as number
                        );
                    });
                    // Add Target;
                    CHAN_SCAL.interpolateMissing();
                    CHAN_ROT.interpolateMissing();
                    CHAN_POS.interpolateMissing();

                    GLAnim = new GLAnimationTarget(CHAN_POS,CHAN_ROT,CHAN_SCAL);
                    GLAnim.targetIndex = sorter.getNodeindex( str[1] );
                    this.Animations.getHash(str[0]).addChannel(  GLAnim  );

                });

                

            }else{
                // HAS NO TARGET AND CAN THEREFORE BE SKIPPED;
                console.warn("NO TARGET FOUND FOR ANIM:\n" + str[0] + "\nTARGET :\n" + str[1]);
            }
        });
      
     
        
    }

    public getAnimations() : GLAnimation[]{
        return this.Animations.getElemList();
    }

}

