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



// vercel serverless functions  timeout默认为10s，免费版最大可设置为60s
// https://vercel.com/guides/what-can-i-do-about-vercel-serverless-functions-timing-out#the-function-is-taking-too-long-to-process-a-request
export default async (req, res) => {
    try {
        let startTime = new Date()
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
        
        let endTime = new Date()
        res.json({
            "last_edited_time": last_edited_time,
            "page_cnt": data.length,
            "time_consumed": `${(endTime - startTime) / 1000} s`
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
    // 年份数组
    let years = []
    let now = new Date().getFullYear()
    // 明年的活动也要算进去
    for (let i = 2021; i <= now + 1; i++) {
        years.push(i)
    }

    // 并行获取所有年份
    console.log("Querying all pages from database:", databaseId);
    const arr = await Promise.all(years.map(year => queryPagesByYear(year)))

    // 汇总结果
    let pages = [];
    arr.forEach(pagesOfYear => {
        pages = pages.concat(pagesOfYear)
    })
    console.log("Total pages queried: ", pages.length);
    return pages
};

const queryPagesByYear = async (year) => {
    let pages = [];
    let cursor = null;

    const filter = {
        and: [
            {property: "北京时间", date: {"on_or_after": `${year}-01-01`}},
            {property: "北京时间", date: {"on_or_before": `${year}-12-31`}},
        ]
    }
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
                filter: filter,
                start_cursor: cursor || undefined,
            });
            pages = pages.concat(response.results);
            cursor = response.next_cursor;
            console.log(year, "next_cursor:", cursor);
        } while (cursor);

        console.log(year, "pages queried: ", pages.length);
    } catch (error) {
        console.error("Failed to query pages:", error);
        throw error;
    }

    return pages
}


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