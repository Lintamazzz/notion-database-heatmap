import { MongoClient } from 'mongodb';
import 'dotenv/config'

export default async (req, res) => {
    // const key = req.query.key
    res.json(await findOne("data"))
}


const findOne = async (key) => {
    const client = new MongoClient(process.env.MONGO_URI);
    const db = client.db(process.env.MONGO_DATABASE);
    const collection = db.collection(process.env.MONGO_COLLECTION);

    try {
        const result = await collection.findOne({ key });

        return result?.data;  // 如果没有找到或没有 data 字段，返回 undefined
    } catch (error) {
        console.error(`MongoDB findOne failed: ${error.message}`);
    } finally {
        await client.close();
    }
}