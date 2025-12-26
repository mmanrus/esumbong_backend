// lib/notificationListener.ts
import pg from "pg"
import { WebSocketServer } from "ws"

const { Pool } = pg

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
})

export const wss = new WebSocketServer({ port: 4001 })

async function startListener() {
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

