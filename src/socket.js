// src/socket.js
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

const stompClient = new Client({
  // SockJS 엔드포인트 (Spring Boot 에 맞춰 변경하세요)
  webSocketFactory: () => new SockJS("http://localhost:8080/ws"),
  reconnectDelay: 5000,
  heartbeatIncoming: 4000,
  heartbeatOutgoing: 4000,
});

// onConnect 에서 구독을 설정합니다.
stompClient.onConnect = () => {
  console.log("✅ STOMP Connected");

  // 채팅이나 AI 동기화도 여기서 구독하시면 됩니다.
  // (CityScene 에서 따로 구독하지 않아도 됨)
};

export default stompClient;
