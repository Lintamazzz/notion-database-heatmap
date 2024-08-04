import 'dotenv/config'

export default async (req, res) => {
    const key = req.query.key
    res.json(await findOne(key))
}


const findOne = async (key) => {
    const endpoint = process.env.MONGO_DATA_API_ENDPOINT
    const apiKey = process.env.MONGO_API_KEY
    const dataSource = process.env.MONGO_DATASOURCE
    const database = process.env.MONGO_DATABASE
    const collection = process.env.MONGO_COLLECTION


    const response = await fetch(endpoint + "/action/findOne", {
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
            }
        })
    })

    const json = await response.json()
    return json?.document?.data
}