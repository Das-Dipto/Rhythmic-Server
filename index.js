const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const stripe = require('stripe')(process.env.PAYMENT_SECRET_KEY)
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
    // await client.connect();

    const userCollection = client.db('rhythm').collection('userInfo');
    const classCollection = client.db('rhythm').collection('classInfo');
    const selectedClassCollection = client.db('rhythm').collection('selectedClassInfo');
    const paymentInfoCollection = client.db('rhythm').collection('paymentInfo');

    //Get Operation for getting all registered users
    app.get('/getAllUsers', async(req, res)=>{
        const result = await userCollection.find().toArray();
        res.send(result);
    })

    //Read operation for getting popular classes
    app.get('/getPopularClasses', async(req, res)=>{
      let sortQuery = {};
      sortQuery = {seats: 1}
      const result = await classCollection.find().sort(sortQuery).limit(6).toArray();
      res.send(result);
   })


   //Get Operation for getting the role of  registered users
   app.get('/getRole', async(req, res)=>{
       let query = {};
       if(req.query?.email){
          query = {email: req.query.email}
       }
       const result = await userCollection.findOne(query);
       res.send(result);
   })

   //Get Operation for getting all regisdterd users who are instructors and also six popular instructor
    app.get('/getInstructors', async(req, res)=>{
        const query = {role:'instructor'}
        const result = await userCollection.find(query).toArray();
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

    //Read operation for getting specific user data through his/her email
    app.get('/selectClasses', async(req, res)=>{
          let query = {};
          if(req.query?.studentEmail){
            query = {addedBy: req.query.studentEmail}
          }
          const result = await selectedClassCollection.find(query).toArray();
          res.send(result);
    })


    //Read operation for getting specific user data through his/her email and id for payment
    app.get('/payClass/:id', async(req, res)=>{
      const id = req.params.id;
      // console.log(id);
      const query = {_id: new ObjectId(id)}
      const result = await selectedClassCollection.findOne(query);
      res.send(result)
    })

    //Read operation for getting enrolled class data of specific student
    app.get('/enrolledClasses', async(req, res)=>{
          let query = {};
          if(req.query?.studentEmail){
            query = {email: req.query.studentEmail}
          }
          const result = await paymentInfoCollection.find(query).sort({ date: -1 }).toArray();
          res.send(result);
    })

    //Read operation for getting data with Instructor name and Class Name
    app.get('/updateSeats', async(req, res) => {
          let query = {};
          if(req.query?.email && req.query?.className){
            query = {instructorEmail: req.query.email, className:req.query?.className};
          }
      const result = await classCollection.findOne(query);
      // console.log(result);
      res.send(result);
    })
 


    //Create Operation for Adding User
      app.post('/allUsers', async(req, res)=>{
        const newUser = req.body;
        // console.log(newUser);
        const result = await userCollection.insertOne(newUser);
        res.send(result);
    })

    //Create Operation for adding class by Instructors
    app.post('/addClasses', async(req, res)=>{
       const newClass = req.body;
      //  console.log(newClass);
       const result = await classCollection.insertOne(newClass);
       res.send(result);
    })


     //Create Operation for adding class into selectedClass
     app.post('/selectedClasses', async(req, res)=>{
       const selectedClass = req.body;
      //  console.log(selectedClass);
       const result = await selectedClassCollection.insertOne(selectedClass);
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

      //Update Operation for updating seats and enrollment data
      app.put('/updatedOnly/:id', async (req, res)=>{
        const ID = req.params.id;
        console.log(ID);
        const info = req.body;
        const filter = {_id: new ObjectId(ID)}
        const options = {upsert: true};
        const updatedData = {
          $set:{
            seats: info.updatedSeats,
            enrollment: info.updatedEnrollment
          }
        }
        const result = await classCollection.updateOne(filter, updatedData, options);  
        res.send(result);
      })

    //   //Update Operation for updating class-status
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


  


    // create payment intent
    app.post('/create-payment-intent', async (req, res) => {
      const { price } = req.body;
      const amount = parseInt(price * 100);
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amount,
        currency: 'usd',
        payment_method_types: ['card']
      });

      res.send({
        clientSecret: paymentIntent.client_secret
      })
    })


      // payment related api
      app.post('/payments',  async (req, res) => {
        const payment = req.body;
        const insertResult = await paymentInfoCollection.insertOne(payment);
        res.send(insertResult);
      })



    //Delete Operation for deleting class from student selected classlist
    app.delete('/deleteClass/:id', async (req, res)=>{
      const id = req.params.id;
      const query = {_id: new ObjectId(id)}
      const result = await selectedClassCollection.deleteOne(query);
      res.send(result);
    })


    //Delete Operation for deleting class from student selected classlist after successful payment and enrollment
    app.delete(`/deleteSelectClass/:id`, async(req, res)=>{
      const id = req.params.id;
      const query = {_id: new ObjectId(id)}
      const result = await selectedClassCollection.deleteOne(query);
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