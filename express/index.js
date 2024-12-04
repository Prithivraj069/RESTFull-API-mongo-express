const express = require("express");
const cors = require("cors");
require("dotenv").config();
const MongoClient = require("mongodb").MongoClient;
const dbname = "recipe_book";

const mongoUri = process.env.MONGO_URI;
// const mongoUri = "mongodb+srv://root:prithiv069@cluster0.k9z8v.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

console.log(mongoUri);

let app = express();

// !! Enable processing JSON data
app.use(express.json());

// !! Enable CORS
app.use(cors());

async function connect(uri, dbname) {
    let client = await MongoClient.connect(uri, {
        useUnifiedTopology: true
    })
    _db = client.db(dbname);
    return _db;
}

// SETUP END
async function main() {

  let db = await connect(mongoUri, dbname);

  // Routes
  app.get('/', function(req,res){
    res.json({
     "message":"Hello World!"
   });
})

}

main();

// START SERVER
app.listen(3000, () => {
  console.log("Server has started");
});