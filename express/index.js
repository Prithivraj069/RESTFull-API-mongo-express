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

const app = express();

app.use(express.json());
app.use(cors());

async function connect(uri, dbname) {
    let client = await MongoClient.connect(uri);
    _db = client.db(dbname);
    return _db;
}

async function main() {

  let db = await connect(mongoUri, dbname);


  app.get('/', function (req, res) {
    res.json({
        'message': 'Hello World!'
    })
})

  app.get('/listings/restaurants', async (req, res) => {

    try{
      const listings = await db.collection(RESTAURANTS)
      .find().project({
          name:1,
          cuisine: 1
      }).limit(15).toArray();

      res.json({
        listings
      })

    } catch (e) {
      console.error("Error fetching recipes:", e);
      res.status(500);
    }  
  })

  app.get('/listings/restaurants/:id', async (req, res) => {
    const id = req.params.id;
    const result = await db.collection(RESTAURANTS)
          .findOne({
            _id: new ObjectId(id)
          })

          res.json({
            result
          })

          console.log(result);
  })

  // POST Method
  app.post('/restaurant', async function (req, res) {

    try {
        if (!req.body.name || !req.body.borough || !req.body.cuisine || !req.body.address.building
            || !req.body.address.street || !req.body.address.zipcode) {
            res.status(400).json({
                'error': 'Missing field'
            });
            return;
        }

        const result = await db.collection(RESTAURANTS).insertOne({
            name: req.body.name,
            borough: req.body.borough,
            cuisine: req.body.cuisine,
            address: {
                building: req.body.address.building,
                street: req.body.address.street,
                zipcode: req.body.address.zipcode
            }
        })

        res.status(201).json({
            result
        })
    } catch (e) {
        res.status(500).json({
            "error": e.message
        })
    }
})

//PUT Method for updating 
app.put('/restaurant/:id', async function (req, res) {
    try {

      const result = await db.collection(RESTAURANTS).updateOne(
        {
          _id: new ObjectId(req.params.id)
        },{
          $set: {
            name:req.body.name,
            cuisine: req.body.cuisine,
            borough: req.body.borough,
            address: {
              building: req.body.address.building,
              street:req.body.address.building,
              zipcode: req.body.address.zipcode
            }
          }
        })

        res.json({
          result
        })

        console.log(result);

    } catch(e) {
      res.sendStatus(500);
    }
})

//DELETE Method

app.delete('/restaurant/:id', async function (req, res) {
  try {

    const result = await db.collection(RESTAURANTS).deleteOne({
      '_id': new ObjectId(req.params.id)
    })

    res.json({
      result
    });
    
    console.log("result successfully deleted: ", result)

  } catch(e) {
    res.sendStatus(500);
  }
})

}

main();

// START SERVER
app.listen(3000, () => {
  console.log("Server has started");
});