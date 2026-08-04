import vuex from "@/store"




export class Message {

  constructor(){
      this.messages=new Map()
      this.events=new Array()
      //{ uuid: args.uuid,type:"method",msg:err, method: args.method, data: null }
      window.addEventListener("message",msg=>{
        if (msg.data.type==='event') {
          this.events.forEach(callback=>{callback(msg.data)})
        }
    })
  }

   uuid() {
    var s = [];
    var hexDigits = "0123456789abcdef";
    for (var i = 0; i < 36; i++) {
      s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
    }
    s[14] = "4"; // bits 12-15 of the time_hi_and_version field to 0010
    s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1); // bits 6-7 of the clock_seq_hi_and_reserved to 01
    s[8] = s[13] = s[18] = s[23] = "-";
  
    var uuid = s.join("");
    return uuid;
  }

  registerEvent(callback){
    this.events.push(callback)
  }

  invoke(methodName,params){
    return  new Promise((resolve,reject)=>{
          const uuid=  this.uuid()

          /**
           * 定义与地图页面数据结构
           */
          const data= {uuid: uuid, method: methodName, data: params}

          /**
           * 回调
           * @param {Object} msg 
           * @returns 
           */
          const callback=(msg)=>{
            const data=msg.data
            if (data && data.uuid && this.messages.delete(data.uuid)) {
                if (data.type==='method') {
                  window.removeEventListener('message',callback)
                  return resolve(data.data)
                }
                return reject()
            }
          }
          
          /**
           * 为获取返回值，添加回调
           */
          window.addEventListener('message',callback)
          this.messages.set(uuid)
          /**
           * 发送消息
           */
          this.iframe.contentWindow.postMessage(data,"*")
          /**
           * 超时处理
           */
          const intervalId=  setTimeout(()=>{
            if (this.messages.delete(data.uuid)) {
              console.error("处理超时 => "+JSON.stringify(data))
              return reject()
            }
            window.removeEventListener('message',callback)
            clearInterval(intervalId)
          },2000)
    })



  }

  install(iframe){
    this.iframe=iframe
  }
}


const message=new Message()

export default message;
