const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const port = process.env.PORT || 3000;

const app = express();
app.use(cors());
app.use(express.json());
const uri = `mongodb+srv://${encodeURIComponent(process.env.DB_USER)}:${encodeURIComponent(process.env.DB_PASS)}@cluster0.r61nha6.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
   
    await client.connect();
    const database = client.db('petService');
    const petService = database.collection('service');
    const ordersCollections = database.collection('orders');
    const usersCollection = database.collection('users');
    const appointmentsCollection = database.collection('appointments');

    // Book appointment
    app.post('/appointments', async (req, res) => {
      try {
        const { doctorName, doctorSpecialty, customerEmail } = req.body;

        if (!doctorName || !customerEmail) {
          return res.status(400).send({
            message: 'Doctor name and customer email are required.'
          });
        }

        // Calculate tomorrow's date using Bangladesh timezone
        const parts = new Intl.DateTimeFormat('en-US', {
          timeZone: 'Asia/Dhaka',
          year: 'numeric',
          month: '2-digit',
          day: '2-digit'
        }).formatToParts(new Date());

        const getPart = (type) =>
          parts.find(item => item.type === type).value;

        const tomorrow = new Date(Date.UTC(
          Number(getPart('year')),
          Number(getPart('month')) - 1,
          Number(getPart('day')) + 1
        ));

        const appointmentDate = [
          tomorrow.getUTCFullYear(),
          String(tomorrow.getUTCMonth() + 1).padStart(2, '0'),
          String(tomorrow.getUTCDate()).padStart(2, '0')
        ].join('-');

        const appointment = {
          doctorName: String(doctorName).trim(),
          doctorSpecialty: String(doctorSpecialty || '').trim(),
          customerEmail: String(customerEmail).trim().toLowerCase(),
          appointmentDate,
          visitingHours: '10:00 AM - 5:00 PM',
          status: 'Booked',
          createdAt: new Date()
        };

        const result = await appointmentsCollection.insertOne(appointment);

        res.status(201).send({
          success: true,
          message: 'Appointment booked successfully!',
          appointmentId: result.insertedId,
          appointment
        });

      } catch (error) {
        console.error('Appointment booking error:', error);
        res.status(500).send({
          message: 'Failed to book appointment.'
        });
      }
    });

    // 🔹 Register user (default role: customer)
    app.post('/users', async (req, res) => {
      const user = req.body;

      const existingUser = await usersCollection.findOne({ email: user.email });
      if (existingUser) {
        return res.send({ message: 'User already exists' });
      }

      const newUser = {
        name: user.name,
        email: user.email,
        photoURL: user.photoURL,
        role:user.role || 'customer',         
        createdAt: new Date()
      };

      const result = await usersCollection.insertOne(newUser);
      res.send(result);
    });

    // 🔹 Get user role by email
    app.get('/users/:email', async (req, res) => {
      const email = req.params.email;
      const result = await usersCollection.findOne({ email });
      res.send(result);
    });
    
    // 🔹 Get all users (Admin)
  app.get('/users', async (req, res) => {
    const result = await usersCollection.find().toArray();
    res.send(result);
  });
  app.delete('/users/:id', async (req, res) => {
  const id = req.params.id;
  const result = await usersCollection.deleteOne({ _id: new ObjectId(id) });
  res.send(result);
});



    app.post('/services', async (req, res)=>{
      const data = req.body;
     data.createdAt = new Date();
      console.log(data); 
      const result = await petService.insertOne(data);
      res.send(result); 
    })


     app.get('/services', async (req, res)=>{
  const { category, location } = req.query;
  console.log('Category:', category, 'Location:', location);
  
  const query = {};

  if(category){
    query.category = category;
  }

  if(location && location.trim() !== ""){
    query.location = { $regex: new RegExp(`^${location}$`, 'i') };
  }

  const result = await petService.find(query).toArray();
  res.send(result);
})


     app.get('/services/:id', async(req, res)=>{
       const id = req.params
       console.log(id);

       const query = {_id: new ObjectId(id)}
       const result = await petService.findOne(query)
       res.send(result);
     })

     app.get('/myservices', async(req, res)=>{
      const email = req.query.email;
      const query = {email: email};
      const result = await petService.find(query).toArray();
      res.send(result);      
     })

     app.put('/update/:id', async(req, res)=>{
      const data = req.body;
      const id = req.params.id;
      const query = {_id: new ObjectId(id)}
      const updateService = {
        $set: data
      }
      const result = await petService.updateOne(query, updateService);
      res.send(result);
     })

      app.delete('/delete/:id', async(req, res)=>{
      const id = req.params.id
      const query = {_id: new ObjectId(id)}
      const result = await petService.deleteOne(query);
      res.send(result); 
      });

    app.post('/orders', async(req, res)=>{
      const data = req.body;
      console.log(data);
      const result = await ordersCollections.insertOne(data);
      res.send(result);
    })
    app.get('/orders', async(req, res)=>{
      const result = await ordersCollections.find().toArray();
      res.status(200).send(result);
    })
    // GET total counts
app.get('/stats', async (req,res)=>{
  const usersCount = await usersCollection.countDocuments();
  const servicesCount = await petService.countDocuments();
  const ordersCount = await ordersCollections.countDocuments();
  res.send({ usersCount, servicesCount, ordersCount });
});


    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {

    // await client.close();
  }
}
run().catch(console.dir);

app.get('/',(req,res)=>{
    res.send('Hello developer')
})

app.listen(port, ()=>{
    console.log(`server is running ${port}`);
    
})