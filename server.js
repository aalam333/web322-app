/*********************************************************************************
WEB322 – Assignment 04
I declare that this assignment is my own work in accordance with Seneca Academic Policy.  
No part of this assignment has been copied manually or electronically from any other source (including 3rd party web sites) or distributed to other students.

Name: Afra Alam
Student ID: 111459236
Date: 12/7/2024
Vercel Web App URL: https://web322-app-flax.vercel.app/
GitHub Repository URL: https://github.com/aalam333/web322-app.git

********************************************************************************/
/** REQUIRING MODULES **/
const express = require("express"); // express
const itemData = require("./store-service"); // store-service
const authData = require("./auth-service"); // auth-service
const path = require("path"); // path

const multer = require("multer"); //multer
const cloudinary = require("cloudinary").v2; //cloudinary
const streamifier = require("streamifier"); //streamifier
const clientSessions = require('client-sessions'); //client sessions

// AS4, Setup handlebars
const exphbs = require("express-handlebars");
const { Console } = require("console");

/** CONFIGURING CLOUDINARY **/
cloudinary.config({
  cloud_name: "dispkzao5",
  api_key: "226132266464889",
  api_secret: "lxldJCCRzGZ819b3LTbncTa9JBA",
  secure: true,
});

const upload = multer(); // no { storage: storage } since we are not using disk storage

const app = express(); // define app

const HTTP_PORT = process.env.PORT || 8080; // assign to port 8080

app.use(express.static("public")); // getting files from public

//This will add the property "activeRoute" to "app.locals" whenever the route changes, i.e. if our route is "/store/5", the app.locals.activeRoute value will be "/store".  Also, if the shop is currently viewing a category, that category will be set in "app.locals".
app.use(function (req, res, next) {
  let route = req.path.substring(1);

  app.locals.activeRoute =
    "/" +
    (isNaN(route.split("/")[1])
      ? route.replace(/\/(?!.*)/, "")
      : route.replace(/\/(.*)/, ""));

  app.locals.viewingCategory = req.query.category;

  next();
});

// client sessions 
app.use(
  clientSessions({
    cookieName: 'session', 
    secret: 'o6LjQ5EVNC28ZgK64hDELM18ScpFQr', 
    duration: 2 * 60 * 1000, 
    activeDuration: 1000 * 60, 
  })
);

app.use(function(req, res, next) {
  res.locals.session = req.session;
  next();
});

app.use(function ensureLogin(req, res, next) {
  if (!req.session.user) {
    res.redirect('/login');
  } else {
    next();
  }
})

app.use(express.urlencoded({ extended: true }));

// Handlebars Setup
app.engine(
  ".hbs",
  exphbs.engine({
    extname: ".hbs",
    helpers: {
      navLink: function (url, options) {
        return (
          '<li class="nav-item"><a ' +
          (url == app.locals.activeRoute
            ? ' class="nav-link active" '
            : ' class="nav-link" ') +
          ' href="' +
          url +
          '">' +
          options.fn(this) +
          "</a></li>"
        );
      },
      equal: function (lvalue, rvalue, options) {
        if (arguments.length < 3)
          throw new Error("Handlebars Helper equal needs 2 parameters");
        if (lvalue != rvalue) {
          return options.inverse(this);
        } else {
          return options.fn(this);
        }
      },
      formatDate: function (dateObj) {
        let year = dateObj.getFullYear();
        let month = (dateObj.getMonth() + 1).toString();
        let day = dateObj.getDate().toString();
        return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
      },
    },
  }),
);

app.set("view engine", ".hbs");

/** ROUTING **/
// ABOUT
app.get("/", (req, res) => {
  res.redirect("/about");
});

app.get("/about", (req, res) => {
  res.render("about");
});

// SHOP
app.get("/shop", async (req, res) => {
  // Declare an object to store properties for the view
  let viewData = {};

  try {
    // declare empty array to hold "item" objects
    let items = [];

    // if there's a "category" query, filter the returned items by category
    if (req.query.category) {
      // Obtain the published "items" by category
      console.log("categories");
      items = await itemData.getPublishedItemsByCategory(req.query.category);
    } else {
      // Obtain the published "items"
      items = await itemData.getPublishedItems();
    }

    // sort the published items by postDate
    items.sort((a, b) => new Date(b.postDate) - new Date(a.postDate));

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
    let categories = await itemData.getCategories();

    // store the "categories" data in the viewData object (to be passed to the view)
    viewData.categories = categories;
  } catch (err) {
    viewData.categoriesMessage = "no results";
  }

  // render the "shop" view with all of the data (viewData)
  res.render("shop", { data: viewData });
});

// Accept queryStrings
app.get("/items", ensureLogin, (req, res) => {
  if (req.query.category) {
    itemData
      .getItemsByCategory(req.query.category)
      .then((data) => {
        if (data.length > 0) {
          res.render("items", { items: data });
        } else {
          res.render("Items", { message: "no results" });
        }
      })
      .catch((err) => {
        res.render("items", { message: "no results" });
      });
  } else if (req.query.minDate) {
    itemData.getItemsByMinDate(req.query.minDate).then((data) => {
      if (data.length > 0) {
        res.render("items", { items: data });
      } else {
        res.render("items", { message: "no results" });
      }
    });
  } else {
    itemData
      .getAllItems()
      .then((data) => {
        if (data.length > 0) {
          res.render("items", { items: data });
        } else {
          res.render("items", { message: "no results" });
        }
      })
      .catch((err) => {
        res.render("items", { message: "no results" });
      });
  }
});

// A route for items/add
app.get("/items/add", ensureLogin, (req, res) => {
  itemData
    .getCategories()
    .then((data) => {
      res.render("addItem", { categories: data });
    })
    .catch((err) => {
      res.render("addItem", { categories: [] });
    });
});

app.post("/items/add", ensureLogin, upload.single("featureImage"), (req, res) => {
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

app.get("/items/delete/:id", ensureLogin, (req, res) => {
  itemData
    .deleteItemById(req.params.id)
    .then(() => {
      res.redirect("/items");
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send("cannot remove category");
    });
});

// Get an individual item
app.get("/items/:id", ensureLogin, (req, res) => {
  itemData
    .getItemById(req.params.id)
    .then((data) => {
      res.json(data);
    })
    .catch((err) => {
      res.json({ message: err });
    });
});

app.get("/categories", ensureLogin, (req, res) => {
  itemData
    .getCategories()
    .then((data) => {
      if (data.length > 0) res.render("categories", { categories: data });
      else res.render("categories", { message: "no results" });
    })
    .catch((err) => {
      res.render("categories", { message: "no results" });
    });
});

app.get("/categories/add", ensureLogin, (req, res) => {
  res.render("addCategory");
});

app.post("/categories/add", ensureLogin, (req, res) => {
  itemData
    .addCategory(req.body)
    .then(() => {
      res.redirect("/categories");
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send("cannot add category");
    });
});

// DELETE CATEGORY
app.get("/categories/delete/:id", ensureLogin, (req, res) => {
  itemData
    .deleteCategoryById(req.params.id)
    .then(() => {
      res.redirect("/categories");
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send("cannot remove category");
    });
});

app.get("/shop/:id", async (req, res) => {
  // Declare an object to store properties for the view
  let viewData = {};

  try {
    // declare empty array to hold "item" objects
    let items = [];

    // if there's a "category" query, filter the returned posts by category
    if (req.query.category) {
      // Obtain the published "posts" by category
      items = await itemData.getPublishedItemsByCategory(req.query.category);
    } else {
      // Obtain the published "posts"
      items = await itemData.getPublishedItems();
    }

    // sort the published items by postDate
    items.sort((a, b) => new Date(b.postDate) - new Date(a.postDate));

    // store the "items" and "item" data in the viewData object (to be passed to the view)
    viewData.items = items;
  } catch (err) {
    viewData.message = "no results";
  }

  try {
    // Obtain the item by "id"
    viewData.item = await itemData.getItemById(req.params.id);
  } catch (err) {
    viewData.message = "no results";
  }

  try {
    // Obtain the full list of "categories"
    let categories = await itemData.getCategories();

    // store the "categories" data in the viewData object (to be passed to the view)
    viewData.categories = categories;
  } catch (err) {
    viewData.categoriesMessage = "no results";
  }

  // render the "shop" view with all of the data (viewData)
  res.render("shop", { data: viewData });
});

// LOGIN *NEW*
app.get("/login", (req, res) => {
  res.render("login")
});

app.post("/login", (req, res) => {
  req.body.userAgent = req.get('User-Agent');

  authData.checkUser(req.body).then((user) => {
    req.session.user = {
        userName: user.userName, // authenticated user's userName
        email: user.email, // authenticated user's email
        loginHistory: user.loginHistory // authenticated user's loginHistory
    }

    res.redirect('/items');
  }).catch((err) => {
    res.render("login", {errorMessage: err, userName: req.body.userName} )
  })

})

// REGISTER *NEW*
app.get("/register", (req, res) => {
  res.render("register")
})

app.post("/register", (req, res) => {
  authData.registerUser(req.body).then(() => {
    res.render("register", { successMessage: "User created"})
  }).catch((err) => {
    res.render("register", {errorMessage: err, userName: req.body.userName} )
  })
})

// 404
app.use((req, res) => {
  res.status(404).render("404");
});

/** INITIALIZE **/
itemData.initialize()
.then(authData.initialize)
.then(function(){
    app.listen(HTTP_PORT, function(){
        console.log("app listening on: " + HTTP_PORT)
    });
}).catch(function(err){
    console.log("unable to start server: " + err);
});
