import pg from "pg"
import { WebSocketServer } from "ws"

const { Pool } = pg

const unpooledUrl = process.env.URL_NEON_UNPOOLED
if (!unpooledUrl) {
  throw new Error("URL_NEON_UNPOOLED is not set")
}

const pool = new Pool({
  connectionString: unpooledUrl,
  ssl: { rejectUnauthorized: false },
})

export const wss = new WebSocketServer({ port: 4001 })

let listenerClient;

async function connectListener() {
  try {
    console.log("🔌 Connecting LISTEN client...")

    listenerClient = await pool.connect()

    await listenerClient.query("LISTEN notifications")
    console.log("👂 Listening on channel: notifications")

    listenerClient.on("notification", (msg) => {
      if (!msg.payload) return

      const payload = JSON.parse(msg.payload)

      wss.clients.forEach((client) => {
        if (client.readyState === 1) {
          client.send(JSON.stringify(payload))
        }
      })
    })

    listenerClient.on("error", (err) => {
      console.error("❌ PG listener error:", err.message)
      reconnect()
    })

    listenerClient.on("end", () => {
      console.warn("⚠️ PG listener ended")
      reconnect()
    })
  } catch (err) {
    console.error("❌ Failed to start listener:", err)
    reconnect()
  }
}

function reconnect() {
  if (listenerClient) {
    listenerClient.release()
    listenerClient = null
  }

  setTimeout(() => {
    connectListener()
  }, 2000) // retry after 2s
}

export function startListener() {
  connectListener()
}
