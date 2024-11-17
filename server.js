/*********************************************************************************
WEB322 – Assignment 04
I declare that this assignment is my own work in accordance with Seneca Academic Policy.  
No part of this assignment has been copied manually or electronically from any other source (including 3rd party web sites) or distributed to other students.

Name: Afra Alam
Student ID: 111459236
Date: 10/9/2024
Vercel Web App URL: https://web322-app-flax.vercel.app/
GitHub Repository URL: https://github.com/aalam333/web322-app.git

********************************************************************************/ 
/** REQUIRING MODULES **/
const express = require('express'); // express
const store_service = require("./store-service"); // store-service
const path = require("path"); // path

const multer = require("multer"); //multer
const cloudinary = require('cloudinary').v2; //cloudinary
const streamifier = require('streamifier'); //streamifier

const exphbs = require("express-handlebars"); //handlebars
const stripJs = require('strip-js'); //strip-js

/** CONFIGURING CLOUDINARY **/
cloudinary.config({
    cloud_name: 'dispkzao5',
    api_key: '226132266464889',
    api_secret: 'lxldJCCRzGZ819b3LTbncTa9JBA',
    secure: true
});

const upload = multer(); // no { storage: storage } since we are not using disk storage

const app = express(); // define app

app.set('views', __dirname + '/views');

const HTTP_PORT = process.env.PORT || 8080; // assign to port 8080

app.use(express.static(path.join(__dirname, 'public'))); // getting files from public

// tell express we are using the HBS engine
app.engine(".hbs", exphbs.engine({ extname: ".hbs" }));
app.set("view engine", ".hbs");

const stripJs = require('strip-js');

//active item
app.use(function(req,res,next){
  let route = req.path.substring(1);
  app.locals.activeRoute = "/" + (isNaN(route.split('/')[1]) ? route.replace(/\/(?!.*)/, "") : route.replace(/\/(.*)/, ""));
  app.locals.viewingCategory = req.query.category;
  next();
});

/** HELPER FUNCTIONS**/
var hbs = exphbs.create({});

hbs.handlebars.registerHelper("navLink", function(url, options) {
  return (
    '<li class="nav-item"><a ' +
    (url == app.locals.activeRoute ? ' class="nav-link active" ' : ' class="nav-link" ') + 
    ' href="' +
    url +
    '">' +
    options.fn(this) +
    "</a></li>"
  );
})

hbs.handlebars.registerHelper("equal", function(lvalue, rvalue, options) {
  if (arguments.length < 3)
    throw new Error("Handlebars Helper equal needs 2 parameters");
  if (lvalue != rvalue) {
    return options.inverse(this);
  } else {
    return options.fn(this);
  }
})

hbs.handlebars.registerHelper("safeHTML", function(context){
  return stripJs(context);
})


/** ROUTING **/
// MAIN PAGE
app.get('/', (req, res) => {
    res.redirect("/about");
});

// ABOUT
app.get('/about', (req, res) => {
    res.render("about")
    //res.sendFile(path.join(__dirname, "/views/about.html"))
});

// STORE

app.get("/store", async (req, res) => {
  // Declare an object to store properties for the view
  let viewData = {};

  try {
    // declare empty array to hold "item" objects
    let items = [];

    // if there's a "category" query, filter the returned items by category
    if (req.query.category) {
      // Obtain the published "item" by category
      items = await store_service.getPublishedItemsByCategory(req.query.category);
    } else {
      // Obtain the published "items"
      items = await store_service.getPublishedItems();
    }

    // sort the published items by itemDate
    items.sort((a, b) => new Date(b.itemDate) - new Date(a.itemDate));

    // get the latest item from the front of the list (element 0)
    let item = items[0];

    // store the "items" and "item" data in the viewData object (to be passed to the view)
    viewData.items = items;
    viewData.item = item;
  } catch (err) {
    viewData.message = "no results";
  }

  try {
    // Obtain the full list of "categories"
    let categories = await store_service.getCategories();

    // store the "categories" data in the viewData object (to be passed to the view)
    viewData.categories = categories;
  } catch (err) {
    viewData.categoriesMessage = "no results";
  }

  // render the "store" view with all of the data (viewData)
  res.render("store", { data: viewData });
});


app.get('/shop/:id', async (req, res) => {

  // Declare an object to store properties for the view
  let viewData = {};

  try{

      // declare empty array to hold "item" objects
      let items = [];

      // if there's a "category" query, filter the returned items by category
      if(req.query.category){
          // Obtain the published "items" by category
          items = await store_service.getPublishedItemsByCategory(req.query.category);
      }else{
          // Obtain the published "items"
          items = await store_service.getPublishedItems();
      }

      // sort the published items by itemDate
      items.sort((a,b) => new Date(b.itemDate) - new Date(a.itemDate));

      // store the "items" and "item" data in the viewData object (to be passed to the view)
      viewData.items = items;

  }catch(err){
      viewData.message = "no results";
  }

  try{
      // Obtain the item by "id"
      viewData.item = await store_service.getItemById(req.params.id);
  }catch(err){
      viewData.message = "no results"; 
  }

  try{
      // Obtain the full list of "categories"
      let categories = await store_service.getCategories();

      // store the "categories" data in the viewData object (to be passed to the view)
      viewData.categories = categories;
  }catch(err){
      viewData.categoriesMessage = "no results"
  }

  // render the "shop" view with all of the data (viewData)
  res.render("shop", {data: viewData})
});

// ITEMS
app.get('/items', (req,res)=>{
    store_service.getAllItems().then((data=>{
      res.render("items", {items: data})
    })).catch(err=>{
      res.render("items", {message: "no results"});
    });
});

// CATEGORIES
app.get('/categories', (req,res)=>{
    store_service.getCategories().then((data=>{
      res.render("categories", {categories: data});
    })).catch(err=>{
      res.render("categories", {message: "no results"});
    });
});

// ADD ITEMS - *NEW*
app.get('/items/add', (req,res)=>{
    res.render("addItem")
});

// ADD ITEMS POST - *NEW*
app.post("/items/add", upload.single("featureImage"), (req, res) => {
  if (req.file) {
    let streamUpload = (req) => {
      return new Promise((resolve, reject) => {
        let stream = cloudinary.uploader.upload_stream((error, result) => {
          if (result) {
            resolve(result);
          } else {
            reject(error);
          }
        });

        streamifier.createReadStream(req.file.buffer).pipe(stream);
      });
    };

    async function upload(req) {
      let result = await streamUpload(req);

      console.log(result);

      return result;
    }

    upload(req).then((uploaded) => {
      processItem(uploaded.url);
    });
  } else {
    processItem("");
  }

  function processItem(imageUrl) {
    req.body.featureImage = imageUrl;

    // TODO: Process the req.body and add it as a new Item before redirecting to /items
    itemData
      .addItem(req.body)
      .then((post) => {
        res.redirect("/items");
      })
      .catch((err) => {
        res.status(500).send(err);
      });
  }
});

// Get an individual item
app.get('/item/:id', (req,res)=>{
    itemData.getItemById(req.params.id).then(data=>{
        res.json(data);
    }).catch(err=>{
        res.json({message: err});
    });
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
