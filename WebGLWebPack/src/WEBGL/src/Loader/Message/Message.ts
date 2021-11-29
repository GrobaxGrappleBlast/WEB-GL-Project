// // Source https://www.youtube.com/watch?v=_wvvtCqXwYY&list=PLv8Ddw9K0JPiTHLMQw31Yh4qyTAcHRnJx&index=7 

import { IMessageHandler } from "./IMessageHandler";
import { MessageBus } from "./MessageBus";

    
    export enum MessagePriority{
        NORMAL,
        HIGH,
    }

    /** 
     * @Message class er en kort besked om noget der sket i programmet
    // @code er den key der bliver brugt i MessageBus classen 
    // @context dataen der sendes med
    // @sender er den classe der sender beskeden. 
    // @priority en værdi der bruges til at enten gå i message Queuen eller gå directe til send. */
    export class Message{
        
        public code: string;
        public context: any;
        public sender: any;
        public priority: MessagePriority;

        public constructor(code:string, sender:any, context?: any, priority:MessagePriority = MessagePriority.NORMAL){
            this.code = code;
            this.sender = sender;
            this.context = context;
            this.priority = priority;
        }

        public static send(code : string , sender : any, context?: any):void{
            MessageBus.post(new Message(code,sender,context, MessagePriority.NORMAL));
        }

        public static sendPriority(code : string , sender : any, context?: any):void{
            MessageBus.post(new Message(code,sender,context, MessagePriority.HIGH));
        }

        public static subscribe(code:string, handler : IMessageHandler):void {
            MessageBus.addSubscription(code,handler);            
        }

        public static unSubscribe(code:string, handler : IMessageHandler):void {
            MessageBus.removeSubscription(code,handler);            
        }
    }
