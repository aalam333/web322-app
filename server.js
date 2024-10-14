/*********************************************************************************
WEB322 – Assignment 02
I declare that this assignment is my own work in accordance with Seneca Academic Policy.  
No part of this assignment has been copied manually or electronically from any other source (including 3rd party web sites) or distributed to other students.

Name: Afra Alam
Student ID: 111459236
Date: 10/9/2024
Vercel Web App URL: 
GitHub Repository URL: 

********************************************************************************/ 
// EXPRESS
const express = require('express'); // express requirement

// STORE-SERVICE
const store_service = require("./store-service");

const path = require('path');

const app = express(); // obtain the "app" object
const HTTP_PORT = process.env.PORT || 8080; // assign a port


app.use((req, res, next) => {
    if (!store_service.getAllItems) {
      store_service
        .initialize()
        .then(() => {
          next();
        })
        .catch((error) => {
          console.error("Initialization Failed:", error);
          res.status(500).send("Internal Server Error");
        });
    } else {
      next();
    }
  });

// ROUTES
// "/" AND "/about"
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '/views/about.html'));
});

app.get('/about', (req, res) => {
    res.sendFile(path.join(__dirname, '/views/about.html'));
});

// "/shop"
app.get('/shop', (req, res) => {
    store_service
    .getPublishedItems()
    .then((items) => {
        res.json(items);
    })
    .catch((error) => {
        console.error("Error getting published items:", error);
        res.status(500).send("Internal Server Error");
    })
});

// "/items"
app.get('/items', (req, res) => {
    store_service
    .getAllItems()
    .then((items) => {
      res.json(items);
    })
    .catch((error) => {
      console.error("Error getting items:", error);
      res.status(500).send("Internal Server Error");
    });
});

// "/categories"
app.get('/categories', (req, res) => {
    store_service
    .getCategories()
    .then((categories) => {
      res.json(categories);
    })
    .catch((error) => {
      console.error("Error getting categories:", error);
      res.status(500).send("Internal Server Error");
    });
});

app.use((req, res, next) => {
    res.status(404).send("404 - We're unable to find what you're looking for.");
});

// Listening on port 8080...
app.listen(HTTP_PORT, () => console.log(`Express http server listening on ${HTTP_PORT}`)); 