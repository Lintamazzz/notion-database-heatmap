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


export default async (req, res) => {
    const response = await notion.databases.retrieve({ database_id: databaseId });
    res.json(dayjs(response.last_edited_time)
        .tz("Asia/Shanghai")
        .format("YYYY-MM-DD HH:mm"))
}