const express = require("express");
const cors = require("cors");
const { ObjectId } = require("mongodb");
require("dotenv").config();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const MongoClient = require("mongodb").MongoClient;

const dbname = "student_db";
const mongoUri = process.env.MONGO_URI;
const MATERIAL = "customer_data";

console.log(mongoUri);

const app = express();

app.use(express.json());
app.use(cors());

async function connect(uri, dbname) {
  let client = await MongoClient.connect(uri);
  _db = client.db(dbname);
  return _db;
}

const generateAcessToken = (id, email) => {
  return jwt.sign(
    {
      user_id: id,
      email: email,
    },
    process.env.TOKEN_SECRET,
    {
      expiresIn: "2h",
    }
  );
};

const verifyToken = (req, res, next) => {
  console.log(req.headers);
  const authHeader = req.headers["authorization"];
  console.log(authHeader);
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) {
    return res.sendStatus(403);
  }

  jwt.verify(token, process.env.TOKEN_SECRET, function (err, user) {
    if (err) {
      return res.sendStatus(403);
    }
    req.user = user;
    next();
  });
};

async function main() {
  let db = await connect(mongoUri, dbname);

  app.post("/users", async (req, res) => {
    const result = await db.collection("users").insertOne({
      email: req.body.email,
      password: await bcrypt.hash(req.body.password, 12),
    });

    res.json({
      message: "New user account",
      result: result,
    });
  });

  app.post("/login", async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }
    const user = await db.collection("users").findOne({ email: email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid password" });
    }
    const accessToken = generateAcessToken(user._id, user.email);
    res.json({ accessToken: accessToken });
  });

  app.get("/profile", verifyToken, (req, res) => {
    res.json({ message: "This is a protected route", user: req.user });
  });

  app.get("/listings/materials", async (req, res) => {
    try {
      const listings = await db
        .collection(MATERIAL)
        .find()
        .project({
          name: 1,
          location: 1,
          quantity: 1,
        })
        .limit(15)
        .toArray();

      res.json({
        listings,
      });
    } catch (e) {
      console.error("Error fetching data:", e);
      res.status(500);
    }
  });

  app.get("/listings/materials/:id", async (req, res) => {
    const id = req.params.id;
    const result = await db.collection(MATERIAL).findOne({
      _id: new ObjectId(id),
    });

    res.json({
      result,
    });

    console.log(result);
  });


  app.get('/search', async function (req, res) {

    try{
    const name = req.query.name;
    // const borough = req.query.borough;
    const limit = req.query.limit || 50;

    // this object will store the search criteria
    let critera = {};

    if (name) {
        critera.name = name; // { cuisine: blah blah blaj}
    }

    if(!name) {
      res.status(400).json({
        error: "Missing field",
      });
      return;
    }

    // if (borough) {
    //     critera['borough'] = borough;  // same as query.borough = borough
    // }
    console.log(critera);

    const results = await db.collection(MATERIAL)
        .find(critera)
        .project({
            'name': 1,
            'date': 1
        }).limit(limit)
        .toArray();

        console.log(results);

    res.json({
        results
    })

  } catch (e) {
    console.error("Error fetching data:", e);
      res.status(500);
  }
})

  // POST Method
  app.post("/material", async function (req, res) {
    try {
      if (
        !req.body.name ||
        !req.body.date ||
        !req.body.material_type ||
        !req.body.quantity
      ) {
        res.status(400).json({
          error: "Missing field",
        });
        return;
      }

      const result = await db.collection(MATERIAL).insertOne({
        name: req.body.name,
        date: req.body.date,
        material_type: req.body.material_type,
        quantity: req.body.quantity,
        address: {
          building: req.body.address.building,
          street: req.body.address.street,
          area: req.body.address.area,
          zipcode: req.body.address.zipcode,
        },
      });

      res.status(201).json({
        result,
      });
    } catch (e) {
      res.status(500).json({
        error: e.message,
      });
    }
  });

  app.post("/materialAdd", async function (req, res) {
    try {
      const { size, type, quantity, material_type } = req.body;
      console.log(material_type);
      console.log(material_type["type"], material_type["size"], material_type["quantity"]);
      const result = await db.collection(MATERIAL).insertOne({
        name: req.body.name,
        date: req.body.date,
        material_type: { 
          size: material_type[0]["size"], 
          type: material_type[0]["type"], 
          quantity: material_type[0]["quantity"] 
        },
        address: {
          building: req.body.address.building,
          street: req.body.address.street,
          area: req.body.address.area,
          zipcode: req.body.address.zipcode,
        },
      });

      res.status(201).json({
        result,
      });
    } catch (e) {
      res.status(500).json({
        error: e.message,
      });
    }
  });

  //PUT Method for updating
  app.put("/material/:id", async function (req, res) {
    try {
      const result = await db.collection(MATERIAL).updateOne(
        {
          _id: new ObjectId(req.params.id),
        },
        {
          $set: {
            name: req.body.name,
            material_type: req.body.material_type,
            quantity: req.body.quantity,
            address: {
              building: req.body.address.building,
              street: req.body.address.building,
              zipcode: req.body.address.zipcode,
            },
          },
        }
      );

      res.json({
        result,
      });

      console.log(result);
    } catch (e) {
      res.sendStatus(500);
    }
  });

  //DELETE Method

  app.delete("/material/:id", async function (req, res) {
    try {
      const result = await db.collection(MATERIAL).deleteOne({
        _id: new ObjectId(req.params.id),
      });

      res.json({
        result,
      });

      console.log("result successfully deleted: ", result);
    } catch (e) {
      res.sendStatus(500);
    }
  });
}

main();

// START SERVER
app.listen(3000, () => {
  console.log("Server has started");
});
