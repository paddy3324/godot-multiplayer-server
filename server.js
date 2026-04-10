const WebSocket = require("ws");

const wss = new WebSocket.Server({ port: 3000 });

let rooms = {};

console.log("Server running on port 3000");

wss.on("connection", (ws) => {
    console.log("Player connected");

    ws.on("message", (message) => {
        const data = JSON.parse(message);

        // JOIN ROOM
        if (data.type === "join") {
            const room = data.room;

            if (!rooms[room]) {
                rooms[room] = [];
            }

            rooms[room].push(ws);
            ws.room = room;

            console.log("Player joined room:", room);
        }

        // PLAYER MOVEMENT
        if (data.type === "move") {
            const room = ws.room;
            if (!room) return;

            rooms[room].forEach(client => {
                if (client !== ws && client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify(data));
                }
            });
        }
    });

    ws.on("close", () => {
        console.log("Player disconnected");

        const room = ws.room;
        if (!room) return;

        rooms[room] = rooms[room].filter(client => client !== ws);
    });
});