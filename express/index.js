const express = require("express");
const cors = require("cors");
const { ObjectId } = require("mongodb");
require("dotenv").config();
const MongoClient = require("mongodb").MongoClient;

const dbname = "sample_restaurants";
const mongoUri = process.env.MONGO_URI;
const RESTAURANTS = "restaurants";
const NIGHBORHOODS = "neighborhoods";

console.log(mongoUri);

let app = express();

// !! Enable processing JSON data
app.use(express.json());

// !! Enable CORS
app.use(cors());

async function connect(uri, dbname) {
    let client = await MongoClient.connect(uri);
    _db = client.db(dbname);
    return _db;
}

// SETUP END
async function main() {

  let db = await connect(mongoUri, dbname);


  app.get('/', function (req, res) {
    res.json({
        'message': 'Hello World!'
    })
})
  // get from server
  app.get('/listings', async (req, res) => {

    try{
      const listings = await db.collection(RESTAURANTS)
      .find(). project({
          name:1,
          cuisine: 1
      }). limit(15).toArray();

      res.json({
        listings
      })

    } catch (e) {
      console.error("Error fetching recipes:", error);
      res.status(500);
    }  
  })

  app.get('/listings/:id', async (req, res) => {
    const id = req.params.id;
    const result = db.collection(RESTAURANTS)
          .findOne({
            _id: new ObjectId(id)
          });

          res.json({
            result
          })
  })

  // POST Method


}

main();

// START SERVER
app.listen(3000, () => {
  console.log("Server has started");
});