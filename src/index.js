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

const userAuthRoutes = require('./routes/user.routes')
app.use('/user',userAuthRoutes)

const cartRoutes = require('./routes/cart.routes')
app.use('/cart',cartRoutes)

const shopAuthRoutes = require('./routes/shop.auth.routes')
app.use('/shop/auth',shopAuthRoutes)

const shopRoutes = require('./routes/shop.routes')
app.use('/shop',shopRoutes)

const itemRoutes = require('./routes/item.routes')
app.use('/item',itemRoutes)

const addressRoutes = require('./routes/address.routes')
app.use('/address',addressRoutes)

const driverRoutes = require('./routes/driver.routes')
app.use('/driver',driverRoutes)

const orderRoutes = require('./routes/order.routes')
app.use('/order',orderRoutes)

const reviewRoutes = require('./routes/review.routes')
app.use('/review',reviewRoutes)
