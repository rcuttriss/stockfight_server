const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const WebSocket = require("ws"); // For connecting to Finnhub

const app = express();
const server = http.createServer(app);
const react_ws = new Server(server, {
  cors: {
    origin: "http://localhost:3000", // Replace with your React app's origin
  },
});

// Finnhub WebSocket connection details (replace with your credentials)
const finnhubWsUrl =
  "wss://ws.finnhub.io?token=cnrugd1r01qqp8d0maf0cnrugd1r01qqp8d0mafg";

let finnhubSocket = null; // Store the Finnhub WebSocket connection

const connectToFinnhub = () => {
  finnhubSocket = new WebSocket(finnhubWsUrl);

  finnhubSocket.onopen = () => {
    console.log("Connected to Finnhub WebSocket API");
    finnhubSocket.send(
      JSON.stringify({ type: "subscribe", symbol: "BINANCE:BTCUSDT" })
    );
  };

  finnhubSocket.onmessage = (message) => {
    const data = JSON.parse(message.data);

    // Emit the received data to the React client(s)
    react_ws.emit("finnhub-data", data);
  };

  finnhubSocket.onerror = (error) => {
    console.error("Error with Finnhub WebSocket:", error);
    // Implement error handling (e.g., reconnect attempts)
  };

  finnhubSocket.onclose = () => {
    console.log("Disconnected from Finnhub WebSocket API");
    // Implement reconnection logic if needed
  };
};

connectToFinnhub(); // Establish connection on server startup

react_ws.on("connection", (socket) => {
  console.log("Client connected to Express server");
});

server.listen(3001, () => {
  console.log("Server listening on port 3001");
});
