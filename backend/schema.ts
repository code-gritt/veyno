import { createSchema } from "graphql-yoga";
import { GraphQLError } from "graphql";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { pool } from "./db";

const typeDefs = `
  enum Role {
    USER
    ADMIN
  }

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
    actions: String!       # JSON string of actions
    costPerEvent: Int!
    status: String!
    createdAt: String!
  }

  type Query {
    me: User!
    getWebhooks: [Webhook!]!
  }

  type Mutation {
    register(email: String!, username: String!, password: String!): AuthPayload!
    login(email: String!, password: String!): AuthPayload!
  }
`;

const resolvers = {
  Query: {
    me: async (_parent: any, _args: any, context: any) => {
      if (!context.userId) {
        throw new GraphQLError("Not authenticated", {
          extensions: { code: "UNAUTHORIZED" },
        });
      }

      const { rows } = await pool.query("SELECT * FROM users WHERE id = $1", [
        context.userId,
      ]);
      if (!rows[0]) {
        throw new GraphQLError("User not found", {
          extensions: { code: "NOT_FOUND" },
        });
      }

      return {
        id: rows[0].id,
        email: rows[0].email,
        username: rows[0].username,
        role: rows[0].role,
        credits: rows[0].credits,
        createdAt: rows[0].created_at.toISOString(),
      };
    },

    getWebhooks: async (_parent: any, _args: any, context: any) => {
      if (!context.userId) {
        throw new GraphQLError("Not authenticated", {
          extensions: { code: "UNAUTHORIZED" },
        });
      }

      const { rows } = await pool.query(
        "SELECT * FROM webhooks WHERE user_id = $1 ORDER BY created_at DESC",
        [context.userId]
      );

      return rows.map((row) => ({
        id: row.id,
        url: row.url,
        actions: JSON.stringify(row.actions), // Ensure actions are a JSON string
        costPerEvent: row.cost_per_event,
        status: row.status,
        createdAt: row.created_at.toISOString(),
      }));
    },
  },

  Mutation: {
    register: async (
      _parent: any,
      {
        email,
        username,
        password,
      }: { email: string; username: string; password: string }
    ) => {
      const hashedPassword = await bcrypt.hash(password, 10);

      const { rows } = await pool.query(
        "INSERT INTO users (email, username, password_hash, credits) VALUES ($1, $2, $3, 50) RETURNING *",
        [email, username, hashedPassword]
      );

      const user = rows[0];
      const token = jwt.sign(
        { userId: user.id, role: user.role },
        "0ab11ca0c2b51e5c33676b50aaf92b32fbe56ef69ff73944db9d3bb833af4580",
        { expiresIn: "24h" }
      );

      return {
        token,
        user: { ...user, createdAt: user.created_at.toISOString() },
      };
    },

    login: async (
      _parent: any,
      { email, password }: { email: string; password: string }
    ) => {
      const { rows } = await pool.query(
        "SELECT * FROM users WHERE email = $1",
        [email]
      );
      if (!rows[0]) {
        throw new GraphQLError("Invalid credentials", {
          extensions: { code: "UNAUTHORIZED" },
        });
      }

      const user = rows[0];
      const valid = await bcrypt.compare(password, user.password_hash);
      if (!valid) {
        throw new GraphQLError("Invalid credentials", {
          extensions: { code: "UNAUTHORIZED" },
        });
      }

      const token = jwt.sign(
        { userId: user.id, role: user.role },
        "0ab11ca0c2b51e5c33676b50aaf92b32fbe56ef69ff73944db9d3bb833af4580",
        { expiresIn: "24h" }
      );

      return {
        token,
        user: { ...user, createdAt: user.created_at.toISOString() },
      };
    },
  },
};

export const schema = createSchema({
  typeDefs,
  resolvers,
});
