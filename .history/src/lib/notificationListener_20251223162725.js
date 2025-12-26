// lib/notificationListener.ts
import pg from "pg"
import { WebSocketServer } from "ws"

const { Pool } = pg
const unpooledUrl = process.env.URL_NEON_UNPOOLED
if (!unpooledUrl) {
     throw new Error("URL_NEON_UNPOOLED is not set please add the required variable, and ask Rusiana if necessary for the URL")
}
const pool = new Pool({
  connectionString: unpooledUrl,
  ssl: true
})

export const wss = new WebSocketServer({ port: 4001 })

export async function startListener() {
  const client = await pool.connect()

  await client.query("LISTEN notifications")

  client.on("notification", (msg) => {
    const payload = JSON.parse(msg.payload)

    wss.clients.forEach((client) => {
      if (client.readyState === 1) {
        client.send(JSON.stringify(payload))
      }
    })
  })
}

