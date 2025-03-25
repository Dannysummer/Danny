// 扩展Window接口，添加global属性
interface Window {
  global: Window;
}

declare module '@stomp/stompjs' {
  export class Stomp {
    static over(socket: any): any;
  }
} 