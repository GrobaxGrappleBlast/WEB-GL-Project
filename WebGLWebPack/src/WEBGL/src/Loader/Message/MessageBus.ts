// // Source https://www.youtube.com/watch?v=_wvvtCqXwYY&list=PLv8Ddw9K0JPiTHLMQw31Yh4qyTAcHRnJx&index=7 

import { IMessageHandler } from "./IMessageHandler";
import { Message, MessagePriority } from "./Message";
import { MessageSubscriptionNode } from "./MessageSubscriptionNode";

    /**
     *  forklaring 
    @code er et keyword der mapper hvor dataen ligger. 
    @IMessageHandler er et simpelt listener pattern. 
    @subscriptions er en array and arrays af IMessageHandlers . Så flere steder kan lytte til om messages kommer ud

    @POST er en metode der Ser efter listeners "subscribers" til en specifik "code"
    og for hver listener til den "code" sender et onMessage() signal. 

    denne classe implementere også en que. sådan at man kan begrænse antal "messages" der biver sendt*/
    export class MessageBus{

        private static _subscriptions: {[code:string]:IMessageHandler[] } = {}
        
        private static _normalQueMessagePrUpdate : number = 10;
        private static _normalQueMessage : MessageSubscriptionNode[] = [];;

        private constructor(){}

        public static addSubscription(code:string, handler:IMessageHandler){
            if(MessageBus._subscriptions[code] === undefined ){
                MessageBus._subscriptions[code] = [];
            }

            if(MessageBus._subscriptions[code].indexOf( handler) !== -1){ // if this hanlder exists 
                console.warn("attempt to add a duplicate handler" + code + ". subscription not added");
            }else{
                MessageBus._subscriptions[code].push(handler);
            }
        }

        public static removeSubscription(code:string, handler:IMessageHandler){
            if(MessageBus._subscriptions[code] === undefined ){
                console.warn("cannot unsubscribe handler from " + code + ". because" + code + "is not subscribed to");
                return;
            }
            let nodeIndex = MessageBus._subscriptions[code].indexOf( handler)
            if(nodeIndex !== -1){ // if this hanlder exists 
                console.warn("cannot unsubscribe handler from " + code + ". because" + code + "is not subscribed to");
                MessageBus._subscriptions[code].splice(nodeIndex, 1);
            }
        }

        public static post(message: Message):void{
            //console.log("message posted:", message);
            let handlers = MessageBus._subscriptions[message.code];
            if(handlers === undefined)
                return;
            
            for (let i = 0; i < handlers.length; i++) {
                let h = handlers[i]
                if(message.priority = MessagePriority.HIGH){
                    h.onMessage(message);
                }else{
                    MessageBus._normalQueMessage.push(new MessageSubscriptionNode(message, h));
                }
            }
        }

        public static update(time:number ):void{
            if(MessageBus._normalQueMessage.length == 0)
                return;
            
            let messageLimit = Math.min(MessageBus._normalQueMessagePrUpdate ,MessageBus._normalQueMessage.length );
            for(let i = 0;i < messageLimit; i++){
                let node = MessageBus._normalQueMessage.pop();
                node.handler.onMessage(node.message);
            }
        }
    }
