const app = require('./app');
require('dotenv').config();
const port = process.env.PORT

const connectDB = require('./db/index');

connectDB().then(()=>{
    app.on('error',(err)=>{
        console.log('Error:',err);
        throw err;
    })

    app.listen(port, ()=>{
        console.log(`example app listening on ${port}`);
    })

}).catch((err)=>{
    console.log('Error in connection to MongoDB server',err);
})

app.get('/health-check',(req,res)=>{
    res.send(`Server is live`);
})

const userRoutes = require('./routes/user.routes')
app.use('/user',userRoutes)

const shopRoutes = require('./routes/shop.routes')
app.use('/shop',shopRoutes)

const itemRoutes = require('./routes/item.routes')
app.use('/item',itemRoutes)
