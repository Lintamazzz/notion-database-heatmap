import { Client } from "@notionhq/client";
import 'dotenv/config'
import dayjs from "dayjs";
import tz from "dayjs/plugin/timezone.js";
import utc from "dayjs/plugin/utc.js";
dayjs.extend(tz); // 时区插件
dayjs.extend(utc);


const notion = new Client({
    auth: process.env.NOTION_TOKEN,
    notionVersion: "2022-06-28",
});
const databaseId = process.env.DATABASE_ID;


// vercel functions
export default async (req, res) => {
    try {
        const [last_edited_time, pages] = await Promise.all([
            getLastEditedTime(),
            queryAllPagesFromDB()
        ])
        const data = pages.map((page) => ({
            date: page.created_time.substring(0, 10),
            cnt: 1,
        }));

        await Promise.all([
            updateOne("last_edited_time", last_edited_time),
            updateOne("data", data)
        ])  
        console.log("update complete")
        
        res.json({
            "time": last_edited_time,
            "data": data.length
        })
    } catch (err) {
        console.error(err)
        res.status(500).json({ error: err.message })
    }
}

const getLastEditedTime =  async () => {
    const res = await notion.databases.retrieve({ database_id: databaseId });
    return dayjs(res.last_edited_time)
            .tz("Asia/Shanghai")
            .format("YYYY-MM-DD HH:mm")
}


const queryAllPagesFromDB = async () => {
    let pages = [];
    let cursor = null;

    console.log("Querying all pages from database:", databaseId);
    try {
        do {
            const response = await notion.databases.query({
                database_id: databaseId,
                sorts: [
                    {
                        property: "北京时间",
                        direction: "ascending",
                    },
                ],
                start_cursor: cursor || undefined,
            });
            pages = pages.concat(response.results);
            cursor = response.next_cursor;
            console.log("next_cursor:", cursor);
        } while (cursor);

        console.log("Total pages queried: ", pages.length);
    } catch (error) {
        console.error("Failed to query pages:", error);
        throw error;
    }

    return pages;
};



const updateOne = async (key, data) => {
    const endpoint = process.env.MONGO_DATA_API_ENDPOINT
    const apiKey = process.env.MONGO_API_KEY
    const dataSource = process.env.MONGO_DATASOURCE
    const database = process.env.MONGO_DATABASE
    const collection = process.env.MONGO_COLLECTION


    const response = await fetch(endpoint + "/action/updateOne", {
        method: "POST",
        headers: {
            "apiKey": apiKey,
            "Content-Type": "application/json",
            "Accept": "application/json"
        },
        body: JSON.stringify({
            "dataSource": dataSource,
            "database": database,
            "collection": collection,
            "filter": {
                "key": key
            },
            "update": {
                "$set": {
                    "data": data
                }
            }
        })
    })
    if (!response.ok) {
        throw new Error(`Update request failed with status ${response.status}`)
    }
}