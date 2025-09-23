import { createYoga } from "graphql-yoga";
import { createServer } from "http";
import { schema } from "./schema";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";

dotenv.config();

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
          process.env.JWT_SECRET ||
            "0ab11ca0c2b51e5c33676b50aaf92b32fbe56ef69ff73944db9d3bb833af4580"
        );
        userId = decoded.userId;
        role = decoded.role;
      } catch (err) {
        console.error("Invalid JWT token", err);
      }
    }

    return { userId, role };
  },
});

const server = createServer(yoga);

server.listen(4000, () => {
  console.log("🚀 Server running at http://localhost:4000/graphql");
});
