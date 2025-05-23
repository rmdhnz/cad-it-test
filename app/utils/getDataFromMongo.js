import { MongoClient } from "mongodb";
const uri = "mongodb://localhost:27017";
const client = new MongoClient(uri);
export default async function getDataFromMongo(collections_name) {
  try {
    await client.connect();
    const database = client.db("mydb");
    let collection = database.collection(collections_name);
    const data = await collection.find().toArray();
    return data;
  } catch (err) {
    console.error("Error:", err);
  } finally {
    await client.close();
  }
}
