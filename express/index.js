const express = require('express');
const cors = require('cors');

let app = express();
app.use(cors());

app.get('/', function(req, res) {
    res.json({
        "message": "Hello world"
    })
})

app.listen(3000, ()=>{
    console.log("Server Started");
})