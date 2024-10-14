const fs = require("fs"); // required at the top of your module

items_data = fs.readFile('./data/items.json', 'utf8', (err, data) => { if (err) throw err; console.log(data);});
categories_data = fs.readFile('./data/categories.json', 'utf8', (err, data) => { if (err) throw err; console.log(data);});


const items = [];
const categories = [];

// Functions for initialization...

function initialize(){
  return new Promise(async (resolve, reject) => {
    try {
      let items = await JSON.parse(items_data);
      console.log(items);
  
      let categories = await JSON.parse(categories_data);
      console.log(categories);

      resolve(items, categories);

    } catch(error) {
      reject("Initialization failed: " + error);
    }
  });
}

function getAllItems(){
  return new Promise((resolve, reject) => {
      if (items.length > 0) {
        resolve(items);
      } else {
        reject("No results returned.");
      }
  });
}

function getPublishedItems(){
    return new Promise((resolve, reject) => {
        const published_items = items.filter((item) =>
            item.published === true,
          );
        if (published_items.length > 0) {
          resolve(published_items);
        } else {
          reject("No results returned.");
        }
    });
}

function getCategories(){
    return new Promise((resolve, reject) => {
        if (categories.length > 0) {
          resolve(categories);
        } else {
          reject("No results returned.");
        }
    });
}

module.exports = {
    initialize,
    getAllItems,
    getPublishedItems,
    getCategories,
  };