import pg from "pg"
import { WebSocketServer } from "ws"

const { Client } = pg

const unpooledUrl = process.env.URL_NEON_UNPOOLED
if (!unpooledUrl) throw new Error("URL_NEON_UNPOOLED is not set")

export const wss = new WebSocketServer({ port: 4001 })

let listenerClient = null
let reconnecting = false

async function connectListener() {
  if (reconnecting) return
  reconnecting = true

  try {
    console.log("🔌 Connecting LISTEN client...")

    listenerClient = new Client({
      connectionString: unpooledUrl,
      ssl: { rejectUnauthorized: false },
      keepAlive: true,
    })

    await listenerClient.connect()
    await listenerClient.query("LISTEN notifications")

    console.log("👂 Listening on channel: notifications")

    listenerClient.on("notification", (msg) => {
      if (!msg.payload) return
      const payload = JSON.parse(msg.payload)

      for (const client of wss.clients) {
        if (client.readyState === 1) {
          client.send(JSON.stringify(payload))
        }
      }
    })

    listenerClient.on("error", (err) => {
      console.error("❌ PG listener error:", err.message)
      cleanupAndReconnect()
    })

    listenerClient.on("end", () => {
      console.warn("⚠️ PG listener ended")
      cleanupAndReconnect()
    })
  } catch (err) {
    console.error("❌ Failed to start listener:", err)
    cleanupAndReconnect()
  } finally {
    reconnecting = false
  }
}

function cleanupAndReconnect() {
  if (listenerClient) {
    try {
      listenerClient.removeAllListeners()
      listenerClient.end().catch(() => {})
    } catch {}
    listenerClient = null
  }

  setTimeout(connectListener, 3000)
}

export function startListener() {
  connectListener()
}
