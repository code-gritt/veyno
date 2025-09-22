import { createYoga } from "graphql-yoga";
import { createServer } from "http";
import { schema } from "./schema";
import dotenv from "dotenv";

dotenv.config();

const yoga = createYoga({
  schema,
  cors: {
    origin: ["http://localhost:5173", "https://veyno.vercel.app"],
    credentials: true,
  },
});

const server = createServer(yoga);

server.listen(4000, () => {
  console.log("Server running at http://localhost:4000/graphql");
});
