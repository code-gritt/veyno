import { createSchema } from "graphql-yoga";
import { GraphQLError } from "graphql";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { pool } from "./db";
import { v4 as uuidv4 } from "uuid";
import { Queue, Worker } from "bullmq";
import Redis from "ioredis";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

const redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379");
export const webhookQueue = new Queue("webhooks", { connection: redis });

// Worker to process webhook events
const webhookWorker = new Worker(
  "webhooks",
  async (job: any) => {
    const { webhookId, payload, eventId } = job.data;

    // Fetch webhook config from Redis or DB
    let webhook = await redis.get(`webhook:${webhookId}`);
    if (!webhook) {
      const { rows } = await pool.query(
        "SELECT * FROM webhooks WHERE id = $1",
        [webhookId]
      );
      if (!rows[0]) throw new Error("Webhook not found");
      webhook = JSON.stringify(rows[0]);
      await redis.setex(`webhook:${webhookId}`, 3600, webhook);
    }
    const parsedWebhook = JSON.parse(webhook);
    const userId = parsedWebhook.user_id;

    // Deduct credits
    const { rows: userRows } = await pool.query(
      "SELECT credits FROM users WHERE id = $1",
      [userId]
    );
    if (userRows[0].credits < parsedWebhook.cost_per_event) {
      await pool.query("UPDATE webhook_events SET status = $1 WHERE id = $2", [
        "REJECTED",
        eventId,
      ]);
      throw new Error("Insufficient credits");
    }
    await pool.query("UPDATE users SET credits = credits - $1 WHERE id = $2", [
      parsedWebhook.cost_per_event,
      userId,
    ]);

    try {
      let processedPayload = payload;
      for (const action of parsedWebhook.actions) {
        switch (action.type) {
          case "transform":
            processedPayload = transformPayload(processedPayload, action.rules);
            break;
          case "route":
            if (conditionalCheck(processedPayload, action.condition)) {
              await fetch(action.url, {
                method: "POST",
                body: JSON.stringify(processedPayload),
              });
            }
            break;
          case "integrate":
            await fetch(action.apiUrl, {
              method: "POST",
              body: JSON.stringify(processedPayload),
            });
            break;
        }
      }

      await pool.query(
        "UPDATE webhook_events SET status=$1, processed_at=NOW() WHERE id=$2",
        ["SUCCESS", eventId]
      );
      return processedPayload;
    } catch (err: any) {
      await pool.query(
        "UPDATE webhook_events SET status=$1, error_message=$2 WHERE id=$3",
        ["FAILED", err.message, eventId]
      );
      throw err;
    }
  },
  { connection: redis }
);

const transformPayload = (payload: any, rules: any) => {
  return { ...payload, transformed: true }; // Placeholder logic
};

const conditionalCheck = (payload: any, condition: any) => true; // Placeholder

const typeDefs = `
  enum Role { USER ADMIN }

  type User {
    id: ID!
    email: String!
    username: String!
    role: Role!
    credits: Int!
    createdAt: String!
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  type Webhook {
    id: ID!
    url: String!
    actions: String!
    costPerEvent: Int!
    status: String!
    createdAt: String!
  }

  type WebhookEvent {
    id: ID!
    webhookId: ID!
    status: String!
    processedAt: String
    errorMessage: String
  }

  type Query {
    me: User!
    getWebhooks: [Webhook!]!
    getWebhookEvents(webhookId: ID): [WebhookEvent!]!
  }

  type Mutation {
    register(email: String!, username: String!, password: String!): AuthPayload!
    login(email: String!, password: String!): AuthPayload!
    createWebhook(actions: [ActionInput!]!, costPerEvent: Int!): Webhook!
    updateWebhook(id: ID!, actions: [ActionInput!], costPerEvent: Int, status: String): Webhook!
    deleteWebhook(id: ID!): Boolean!
  }

  input ActionInput {
    type: String!
    rules: String
    condition: String
    url: String
    apiUrl: String
  }
`;

const resolvers = {
  Query: {
    me: async (_parent: any, _args: any, context: any) => {
      if (!context.userId) throw new GraphQLError("Not authenticated");

      const { rows } = await pool.query("SELECT * FROM users WHERE id=$1", [
        context.userId,
      ]);
      if (!rows[0]) throw new GraphQLError("User not found");

      const user = rows[0];
      return { ...user, createdAt: user.created_at.toISOString() };
    },

    getWebhooks: async (_parent: any, _args: any, context: any) => {
      if (!context.userId) throw new GraphQLError("Not authenticated");

      const { rows } = await pool.query(
        "SELECT * FROM webhooks WHERE user_id=$1 ORDER BY created_at DESC",
        [context.userId]
      );
      return rows.map((r) => ({
        id: r.id,
        url: r.url,
        actions: JSON.stringify(r.actions),
        costPerEvent: r.cost_per_event,
        status: r.status,
        createdAt: r.created_at.toISOString(),
      }));
    },

    getWebhookEvents: async (
      _parent: any,
      { webhookId }: { webhookId: string },
      context: any
    ) => {
      if (!context.userId) throw new GraphQLError("Not authenticated");

      const { rows } = await pool.query(
        "SELECT * FROM webhook_events WHERE webhook_id=$1 ORDER BY processed_at DESC LIMIT 50",
        [webhookId]
      );
      return rows.map((r) => ({
        id: r.id,
        webhookId: r.webhook_id,
        status: r.status,
        processedAt: r.processed_at?.toISOString(),
        errorMessage: r.error_message,
      }));
    },
  },

  Mutation: {
    register: async (_parent: any, { email, username, password }: any) => {
      const hashed = await bcrypt.hash(password, 10);
      const { rows } = await pool.query(
        "INSERT INTO users (email, username, password_hash, credits) VALUES ($1, $2, $3, 50) RETURNING *",
        [email, username, hashed]
      );
      const user = rows[0];
      const token = jwt.sign(
        { userId: user.id, role: user.role },
        process.env.JWT_SECRET || "secret",
        {
          expiresIn: "24h",
        }
      );
      return {
        token,
        user: { ...user, createdAt: user.created_at.toISOString() },
      };
    },

    login: async (_parent: any, { email, password }: any) => {
      const { rows } = await pool.query("SELECT * FROM users WHERE email=$1", [
        email,
      ]);
      if (!rows[0]) throw new GraphQLError("Invalid credentials");

      const user = rows[0];
      const valid = await bcrypt.compare(password, user.password_hash);
      if (!valid) throw new GraphQLError("Invalid credentials");

      const token = jwt.sign(
        { userId: user.id, role: user.role },
        process.env.JWT_SECRET || "secret",
        {
          expiresIn: "24h",
        }
      );
      return {
        token,
        user: { ...user, createdAt: user.created_at.toISOString() },
      };
    },

    createWebhook: async (
      _parent: any,
      { actions, costPerEvent }: any,
      context: any
    ) => {
      if (!context.userId) throw new GraphQLError("Not authenticated");

      const uniqueId = uuidv4();
      const url = `/webhooks/${context.userId}/${uniqueId}`;
      const fullUrl = `${
        process.env.API_BASE_URL || "http://localhost:4000"
      }${url}`;

      const { rows } = await pool.query(
        "INSERT INTO webhooks (user_id, url, actions, cost_per_event) VALUES ($1, $2, $3, $4) RETURNING *",
        [context.userId, fullUrl, JSON.stringify(actions), costPerEvent]
      );
      const webhook = rows[0];
      await redis.setex(`webhook:${webhook.id}`, 3600, JSON.stringify(webhook));
      return {
        ...webhook,
        actions: JSON.stringify(webhook.actions),
        createdAt: webhook.created_at.toISOString(),
      };
    },

    updateWebhook: async (
      _parent: any,
      { id, actions, costPerEvent, status }: any,
      context: any
    ) => {
      if (!context.userId) throw new GraphQLError("Not authenticated");

      const updates: any = {};
      if (actions) updates.actions = JSON.stringify(actions);
      if (costPerEvent !== undefined) updates.cost_per_event = costPerEvent;
      if (status) updates.status = status;

      const { rows } = await pool.query(
        `UPDATE webhooks SET ${Object.keys(updates)
          .map((k, i) => `${k}=$${i + 1}`)
          .join(", ")} WHERE id=$${
          Object.keys(updates).length + 1
        } AND user_id=$${Object.keys(updates).length + 2} RETURNING *`,
        [...Object.values(updates), id, context.userId]
      );

      if (!rows[0]) throw new GraphQLError("Webhook not found");

      const webhook = rows[0];
      await redis.del(`webhook:${webhook.id}`);
      return {
        ...webhook,
        actions: JSON.stringify(webhook.actions),
        createdAt: webhook.created_at.toISOString(),
      };
    },

    deleteWebhook: async (_parent: any, { id }: any, context: any) => {
      if (!context.userId) throw new GraphQLError("Not authenticated");

      const { rowCount } = await pool.query(
        "DELETE FROM webhooks WHERE id=$1 AND user_id=$2",
        [id, context.userId]
      );
      if (rowCount === 0) throw new GraphQLError("Webhook not found");

      await redis.del(`webhook:${id}`);
      return true;
    },
  },
};

export const schema = createSchema({
  typeDefs,
  resolvers,
});
