import { createYoga } from "graphql-yoga";
import { createServer } from "http";
import express, { Request, Response } from "express";
import { schema, webhookQueue } from "./schema";
import { pool } from "./db";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";

dotenv.config();

const app = express();

// Parse JSON with 1MB limit
app.use(express.json({ limit: "1mb" }));

// ----------------------
// Webhook Endpoint
// ----------------------
app.post("/webhooks/:userId/:uniqueId", async (req: Request, res: Response) => {
  const { userId, uniqueId } = req.params;
  const payload = req.body;

  try {
    // Check if webhook exists and is active
    const { rows } = await pool.query(
      "SELECT id FROM webhooks WHERE user_id = $1 AND unique_id = $2 AND status = 'ACTIVE'",
      [userId, uniqueId]
    );
    if (!rows[0]) {
      return res.status(404).json({ error: "Webhook not found" });
    }

    const webhookId = rows[0].id;

    // Log event in database
    const { rows: eventRows } = await pool.query(
      "INSERT INTO webhook_events (webhook_id, user_id, payload) VALUES ($1, $2, $3) RETURNING id",
      [webhookId, userId, JSON.stringify(payload)]
    );
    const eventId = eventRows[0].id;

    // Add job to BullMQ queue
    await webhookQueue.add("process", { webhookId, payload, eventId });

    return res.status(202).json({ message: "Event queued", eventId });
  } catch (err) {
    console.error("Webhook processing error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// ----------------------
// GraphQL Yoga Setup
// ----------------------
const yoga = createYoga({
  schema,
  cors: {
    origin: ["http://localhost:5173", "https://veyno.vercel.app"],
    credentials: true,
  },
  context: ({ request }) => {
    const authHeader = request.headers.get("authorization");
    let userId: string | null = null;
    let role: string | null = null;

    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.replace("Bearer ", "");
      try {
        const decoded: any = jwt.verify(
          token,
          "0ab11ca0c2b51e5c33676b50aaf92b32fbe56ef69ff73944db9d3bb833af4580" ||
            "secret"
        );
        userId = decoded.userId;
        role = decoded.role;
      } catch (err) {
        console.warn("Invalid JWT token:");
      }
    }

    return { userId, role };
  },
});

// Mount GraphQL endpoint
app.use("/graphql", yoga);

// ----------------------
// Start HTTP Server
// ----------------------
const server = createServer(app);
const PORT = process.env.PORT || 4000;

server.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}/graphql`);
  console.log("🔗 Webhook endpoints active at /webhooks/:userId/:uniqueId");
});
