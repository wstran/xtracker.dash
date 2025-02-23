import {NextApiRequest, NextApiResponse} from "next";
import {Server, Socket} from "socket.io";
import {getServerSession} from "next-auth/next";
import {authOptions} from "@/pages/api/auth/[...nextauth]";
import {CollectionManager} from "@/libs/mongodb-wrapper";
import {RedisKeyValueStore} from "@/libs/redis-wrapper";

type Session = { address: string | null };

const redis_key_value_store = new RedisKeyValueStore();

let updateInterval: NodeJS.Timeout;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    // @ts-ignore
    const session: Session | null = await getServerSession(req, res, authOptions);

    if (!session || !session.address) {
        res.status(!session ? 401 : 400).json({ message: !session ? "Unauthorized" : "Invalid session data" });
        return;
    }

    const cms_user_collection = await new CollectionManager("cms-users").getCollection();
    const user = await cms_user_collection.findOne({ user_address: session.address });

    if (!user || user.role === "subscriber") {
        res.status(403).json({ message: "Forbidden" });
        return;
    }

    const res_socket = res.socket as unknown as Record<string, Record<string, Socket>> | null;

    if (!res_socket?.server.io) {
        const server = res_socket?.server;
        const io = new Server(server, {
            cors: {
                origin: process.env.NEXTAUTH_URL,
                methods: ["GET"],
            },
        });

        updateInterval && clearInterval(updateInterval);

        updateInterval = setInterval(async () => {
            io.emit("message", await redis_key_value_store.get('CMS_CRAWL') || []);
        }, 1000);

        io.on("connection", (socket) => {
            console.log("Client connected:", socket.id);

            socket.on("disconnect", () => {
                console.log("Client disconnected:", socket.id);
            });
        });

        io.on("close", () => clearInterval(updateInterval));

        // @ts-ignore
        res.socket.server.io = io;
    }

    res.status(200).end();
}