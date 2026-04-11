const WebSocket = require("ws");

// ✅ REQUIRED for Render
const port = process.env.PORT || 3000;
const wss = new WebSocket.Server({ port });

let rooms = {};

console.log("Server running on port", port);

wss.on("connection", (ws) => {
    console.log("Player connected");

    // ✅ give each player a unique ID
    ws.id = Math.random().toString(36).substr(2, 9);

    ws.on("message", (message) => {
        let data;

        try {
            data = JSON.parse(message);
        } catch (e) {
            console.log("Invalid JSON:", message);
            return;
        }

        // JOIN ROOM
        if (data.type === "join") {
            const room = data.room;

            if (!rooms[room]) {
                rooms[room] = [];
            }

            rooms[room].push(ws);
            ws.room = room;

            console.log("Player joined room:", room);

            // ✅ tell the player their ID
            ws.send(JSON.stringify({
                type: "init",
                id: ws.id
            }));
        }

        // PLAYER MOVEMENT
        if (data.type === "move") {
            const room = ws.room;
            if (!room) return;

            const sendData = {
                type: "move",
                id: ws.id,
                x: data.x,
                y: data.y
            };

            rooms[room].forEach(client => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify(sendData));
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