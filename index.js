const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const app = express();
const port = process.env.PORT || 5000;



// middleware

app.use(cors());
app.use(express.json());






const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.oldlbnp.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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

    const bookCollection = client.db('bookDB').collection('book');


    app.get('/myBook/:email', async(req, res) => {
      console.log(req.params.email);
      const result = await bookCollection.find({email:req.params.email}).toArray();
      res.send(result)
    })



  // app.get('/updateBook/:id', async(req, res) =>{
  //   console.log(req.params.id)
  //   const result = await bookCollection.findOne({_id: req.params.id})
  //   res.send(result)
  // })    



  app.get('/book/:id', async(req, res) => {
    const id = req.params.id;
    const query = {_id: new ObjectId(id)}
    const result = await bookCollection.findOne(query);
    res.send(result)
  })


  app.delete('/delete/:id', async(req, res) => {
    const id = req.params.id;
    const query = {_id: new ObjectId(id) }
    const result = await bookCollection.deleteOne(query);
    res.send(result);
  })


 



  app.get('/books', async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const category = req.query.category || '';

    const bookCollection = client.db('bookDB').collection('book');
    const query = category ? { category } : {};

    try {
        const cursor = bookCollection.find(query).skip(skip).limit(limit);
        const books = await cursor.toArray();
        res.json(books);
    } catch (error) {
        console.error('Error fetching books:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


app.get('/booksCount', async (req, res) => {
    const category = req.query.category || '';
    const bookCollection = client.db('bookDB').collection('book');
    const query = category ? { category } : {};

    try {
        const count = await bookCollection.countDocuments(query);
        res.json({ count });
    } catch (error) {
        console.error('Error getting book count:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});











app.get('/all-book', async (req, res) => {
  const size = parseInt(req.query.size) || 10; // Default size of 10
  const page = parseInt(req.query.page) || 1; // Default page 1
  const filter = req.query.filter;
  const skip = (page - 1) * size;

  console.log("Filter received from client:", filter); // Add this line to log the filter value

  let query = {};
  if (filter) {
    query = { category: filter };
  }

  console.log("Query used for filtering:", query); // Add this line to log the query used for filtering

  try {
    const bookCollection = client.db('bookDB').collection('book');
    const result = await bookCollection.find(query).skip(skip).limit(size).toArray();
    console.log("Filtered books:", result); // Add this line to log the filtered books
    res.json(result);
  } catch (error) {
    console.error('Error fetching books:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
















  // My code
  
  // app.get('/all-book', async(req,res) => {

  //   const result = await bookCollection.find(size).limit().toArray()
  //   const size = parseInt(req.query.size)
  //   const page = req.query.page
  //   console.log(size, page)
  //   res.send(result)
  // })


  

  app.get('/booksCount', async (req, res) => {
   
    try {
      const count = await bookCollection.estimatedDocumentCount();
      res.json({ count });
    } catch (error) {
      console.error("Error getting book count:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });



//   app.get('/all-book', async (req, res) => {
//     const size = parseInt(req.query.size);
//     const page = parseInt(req.query.page) || 1;
//     const skip = (page - 1) * size;

//     try {
//         const bookCollection = client.db('bookDB').collection('book');
//         const result = await bookCollection.find().skip(page).limit(size).toArray();
//         res.send(result);
//     } catch (error) {
//         console.error('Error fetching books:', error);
//         res.status(500).json({ error: 'Internal Server Error' });
//     }
// });







app.get('/all-book', async(req,res) => {
  const size = parseInt(req.query.size);
  const page = parseInt(req.query.page);
  console.log(size, page);
  const result = await bookCollection.find().skip(page * size).limit(size).toArray();
  res.send(result);
})



























  app.delete('/myBook/:id', async(req, res) => {
    const id = req.params.id;
    const query = {_id: new ObjectId(id) }
    const result = await bookCollection.deleteOne(query);
    res.send(result);
  })
  



  app.put('/book/:id', async(req, res) => {
    const id = req.params.id;
    const filter ={ _id: new ObjectId(id)}
    const options = {upsert: true};
    const updatedBook = req.body;
    const book ={
      $set: {
        img: updatedBook.name,
        authorName: updatedBook.authorName,
        names: updatedBook.names,
        shortDes: updatedBook.shortDes,
        category: updatedBook.category,
        ratings: updatedBook.ratings,
        aboutTheBook: updatedBook.aboutTheBook,
        writerName: updatedBook.writerName,
        quantity: updatedBook.quantity,
      }
    }


    const result = await bookCollection.updateOne(filter, book, options)
    res.send(result);

  })


    app.get('/book', async(req, res) => {
      const cursor = bookCollection.find();
      const result = await cursor.toArray();
      res.send(result)
  })


    app.post('/book', async(req, res) => {
        const newBook = req.body;
        console.log(newBook);
        const result = await bookCollection.insertOne(newBook);
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







app.get('/', (req, res) =>{
    res.send('Library is running')
})

app.listen(port, () => {
    console.log(`Library Server Is Running on port${port}`)
})