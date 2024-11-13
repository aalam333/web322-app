/*********************************************************************************
WEB322 – Assignment 02
I declare that this assignment is my own work in accordance with Seneca Academic Policy.  
No part of this assignment has been copied manually or electronically from any other source (including 3rd party web sites) or distributed to other students.

Name: Afra Alam
Student ID: 111459236
Date: 10/9/2024
Vercel Web App URL: 
GitHub Repository URL: https://github.com/aalam333/web322-app.git

********************************************************************************/ 
/** REQUIRING MODULES **/
const express = require('express'); // express
const store_service = require("./store-service"); // store-service
const path = require("path"); // path
const multer = require("multer"); //multer
const cloudinary = require('cloudinary').v2 //cloudinary
const streamifier = require('streamifier') //streamifier

/** CONFIGURING CLOUDINARY **/
cloudinary.config({
    cloud_name: 'dispkzao5 ',
    api_key: '226132266464889',
    api_secret: 'lxldJCCRzGZ819b3LTbncTa9JBA',
    secure: true
});

const fileUpload = multer(); // no { storage: storage } since we are not using disk storage

const app = express(); // define app

const HTTP_PORT = process.env.PORT || 8080; // assign to port 8080

app.use(express.static('public')); // getting files from public


/** ROUTING **/
// MAIN PAGE
app.get('/', (req, res) => {
    res.redirect("/about");
});

// ABOUT
app.get('/about', (req, res) => {
    res.sendFile(path.join(__dirname, "/views/about.html"))
});

// STORE
app.get('/store', (req,res)=>{
    store_service.getPublishedItems().then((data=>{
        res.json(data);
    })).catch(err=>{
        res.json({message: err});
    });
});

// ITEMS
app.get('/items', (req,res)=>{
    store_service.getAllItems().then((data=>{
        res.json(data);
    })).catch(err=>{
        res.json({message: err});
    });
});

// CATEGORIES
app.get('/categories', (req,res)=>{
    store_service.getCategories().then((data=>{
        res.json(data);
    })).catch(err=>{
        res.json({message: err});
    });
});

// ADD ITEMS - *NEW*
app.get('/items/add', (req,res)=>{
    res.sendFile(path.join(__dirname, "/views/addItem.html"))
});

// ADD ITEMS POST - *NEW*
app.post('/items/add', fileUpload.single('image'), (req, res) => {
    if(req.file){
        let streamUpload = (req) => {
            return new Promise((resolve, reject) => {
                let stream = cloudinary.uploader.upload_stream(
                    (error, result) => {
                        if (result) {
                            resolve(result);
                        } else {
                            reject(error);
                        }
                    }
                );
    
                streamifier.createReadStream(req.file.buffer).pipe(stream);
            });
        };
    
        async function upload(req) {
            let result = await streamUpload(req);
            console.log(result);
            return result;
        }
    
        upload(req).then((uploaded)=>{
            processItem(uploaded.url);
        });
    }else{
        processItem("");
    }
     
    function processItem(imageUrl){
        req.body.featureImage = imageUrl;
    
        // TODO: Process the req.body and add it as a new Item before redirecting to /items
        store_service.addItem(req.body).then(
            res.send({ body: req.body, file: req.file}),
            res.redirect(301, path.join(__dirname, "/views/about.html"))
        ).catch(err=>{
            res.json({message: err});
        })
    } 
});

// 404 PAGE NOT FOUND
app.use((req,res)=>{
    res.status(404).send("404 - Page Not Found")
})

//INITIALIZE THEN LISTEN
store_service.initialize().then(()=>{
    app.listen(HTTP_PORT, () => { 
        console.log('server listening on: ' + HTTP_PORT); 
    });
}).catch((err)=>{
    console.log(err);
})
