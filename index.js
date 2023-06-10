const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ngkdodk.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const userCollection = client.db('rhythm').collection('userInfo');
    const classCollection = client.db('rhythm').collection('classInfo');

    //Get Operation for getting all regisdterd users
    app.get('/getAllUsers', async(req, res)=>{
        const result = await userCollection.find().toArray();
        res.send(result);
    })


    //Read operation for getting specific user data through his/her email
    app.get('/getAllClasses', async(req, res)=>{
          let query = {};
          if(req.query?.instructorEmail){
            query = {instructorEmail: req.query.instructorEmail}
          }
          let sortQuery = {};
          sortQuery = {price: -1}
          
          const result = await classCollection.find(query).sort(sortQuery).toArray();
          res.send(result);
    })


    //Read operation for getting all class data
    app.get('/allClasses', async(req, res)=>{
         const result = await classCollection.find().toArray();
         res.send(result);
      })

    //Read operation for finding single class data
    app.get('/updateClassInfo/:id', async(req, res)=>{
          const id = req.params.id;
          const query = {_id: new ObjectId(id)}
          const result = await classCollection.findOne(query);
          res.send(result)
      })

    //Read operation for finding approved class data
    app.get(`/getApprovedClass`, async(req, res)=>{
       const query = { status: 'Approved' };
        const result = await classCollection.find(query).toArray();
        res.send(result);
    })


    //Create Operation for Adding User
      app.post('/allUsers', async(req, res)=>{
        const newUser = req.body;
        console.log(newUser);
        const result = await userCollection.insertOne(newUser);
        res.send(result);
    })

    //Create Operation for adding class by Instructors
    app.post('/addClasses', async(req, res)=>{
       const newClass = req.body;
       console.log(newClass);
       const result = await classCollection.insertOne(newClass);
       res.send(result);
    })


     //Update Operation for updating user-role
     app.put('/updateUserRole/:id', async(req, res)=>{
      const id = req.params.id;
      const info = req.body;
      const filter = {_id: new ObjectId(id)}
      const options = {upsert: true};
      const updatedData = {
        $set:{
          role: info.role,
        }
      }

      const result = await userCollection.updateOne(filter, updatedData, options);  
      res.send(result);
    })


     //Update Operation for updating class-info
     app.put('/updateClass/:id', async(req, res)=>{
      const id = req.params.id;
      const info = req.body;
      const filter = {_id: new ObjectId(id)}
      const options = {upsert: true};
      const updatedData = {
        $set:{
          instructorName: info.instructorName,
          className: info.className,
          instructorEmail: info.instructorEmail,
          price: info.price,
          seats: info.seats
        }
      }

      const result = await classCollection.updateOne(filter, updatedData, options);  
      res.send(result);
    })


      //Update Operation for updating class-status
     app.put('/updateClassStatus/:id', async(req, res)=>{
      const id = req.params.id;
      const info = req.body;
      const filter = {_id: new ObjectId(id)}
      const options = {upsert: true};
      const updatedData = {
        $set:{
          status: info.status,
          feedback: info.feedback
        }
      }

      const result = await classCollection.updateOne(filter, updatedData, options);  
      res.send(result);
    })




    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get('/', (req, res)=>{
    res.send('Server is running')
})

app.listen(port, ()=>{
    console.log(`Server is running in the port: ${port}`);
})