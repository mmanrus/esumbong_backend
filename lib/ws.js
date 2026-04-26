import { WebSocketServer } from "ws";


const clients = new Map()

export function initWebSocket(server) {
    const wss = new WebSocketServer({ server, clientTracking: true })
    wss.on("connection", function connection(ws, request) {
        const clientIp = request.socket.remoteAddress
        ws.on("message", (message) => {
            const data = JSON.parse(message)

            if (data.type === "AUTH") {
                ws.userId = data.userId
                ws.type = data.role
                ws.barangayId = data.barangayId
                clients.set(String(data.userId), {
                    ws,
                    type: data.role,
                    barangayId: data.barangayId
                })
            }

        })

        ws.on("error", (error) => {
            if (process.env.NODE_ENV === "development") {
                console.error("Websocket error:", error)
            }
        })
        ws.on('close', () => {
            if (ws.userId) {
                clients.delete(ws.userId)
            }
            if (process.env.NODE_ENV === "development") {
            
                console.log("Client disconnected")
            }
        })
        ws.on("pong", () => {
            ws.isAlive = true
        })

        ws.isAlive = true
    })

    const interval = setInterval(() => {
        wss.clients.forEach((ws) => {
            if (ws.isAlive === false) {
                return ws.terminate()
            }

            ws.isAlive = false
            ws.ping()
        })
    }, 30000)

    wss.on('close', () => {
        clearInterval(interval)
    })
}

export { clients }


export function sendToUser(userId, payload) {
    const client = clients.get(String(userId))

    if (client?.ws?.readyState === 1) { // 1 = OPEN
        console.log("Sending WS payload to", userId, payload)
        client.ws.send(JSON.stringify(payload))
    } else {
        console.log("User not connected or socket closed", userId)
    }
}

export function sendToBarangay(barangayId, type, data) {
    const payload = { type, hotline: data };
    let sentCount = 0
    for (const [userId, client] of clients) {
        if (client.barangayId === barangayId && client.ws?.readyState === 1) { // 1 = OPEN
            console.log("Sending WS payload to user", userId, "in barangay", barangayId, payload)
            client.ws.send(JSON.stringify(payload))
            sentCount++
        }
    }
    console.log(`Sent payload to ${sentCount} users in barangay ${barangayId}`)
}