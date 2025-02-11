import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { NextApiRequest, NextApiResponse } from "next";
import { CollectionManager } from '@/libs/mongodb-wrapper';

type Session = { address: string | null };

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
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

    if (req.method === "POST") {
        let { username } = req.body;

        if (!username) {
            res.status(400).json({ message: "Invalid username" });
            return;
        }

        username = username.toLowerCase();

        try {
            const kols_collection = await new CollectionManager("service_kols").getCollection();

            const result = await kols_collection.updateOne(
                { username },
                { $setOnInsert: { username, created_at: new Date() } },
                { upsert: true }
            );

            if (!result.acknowledged) {
                res.status(500).json({ message: "Could not add the influencer" });
                return;
            }

            res.status(200).send('OK');
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Could not add the influencer" });
        }
    } else {
        res.status(405).json({ message: "Method not allowed" });
    }
};

export default handler;
