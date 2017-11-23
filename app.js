const express = require ('express'); 
const bodyParser = require ('body-parser');
const ejs = require ('ejs');
const Nexmo = require('nexmo');
const socketio = require('socket.io');

//init Nexmo 
const nexmo = new Nexmo({
    apiKey: 'cd07115f',
    apiSecret: '7da1e9b2f08becd9'
}, {debut: true});

//init app 
const app = express(); 

//template engine setup
app.set('view engine', 'html'); 
app.engine('html', ejs.renderFile); 

//public folder setup - client side
app.use(express.static(__dirname + '/public')); /*public folder is static */

//body parser middleware 
app.use(bodyParser.json()); 
app.use(bodyParser.urlencoded({extended: true }));

//Index Route
app.get('/', (req, res) => {
    res.render('index');
});

//catch form submit
app.post('/', (req, res) => {
    // res.send(req.body); 
    // console.log(req.body); //what's actually being submitted
    const number = req.body.number; 
    const text = req.body.text; 

    nexmo.message.sendSms( 
    '12015471279', number, text, {type: 'unicode'}, 
    (err, responseData) => {
        if(err){
            console.log(err);
        } else {
            console.dir(responseData); //dir lists out everything that it gives us back. we pass in response data

            //Get data from the response ie. responseData
            const data = {
                id: responseData.messages[0]['message-id'],
                number: responseData.messages[0]['to'] 
            }

            //Emit to the client 
            io.emit('smsStatus', data); 


             }
        }
    );
}); 


//Define port to start server
const port = 3000; 

//start server
const server = app.listen(port, () => console.log(`Server started on port ${port}`)); 


//conncet to socket.io
const io = socketio(server); 
io.on('connection', (socket) =>{
    console.log('Connected');
    io.on('disconnect', () => {
        console.log('Disconnected');
    })
})
