// REQUIRE MODULE FS
const fs = require("fs");

// CREATE EMPTY ARRAYS FOR POSTS AND CATEGORIES
let posts = [];
let categories = [];

/** MODULES **/
// INITIALIZE
function initialize() {
    return new Promise((resolve, reject) => {
        fs.readFile('./data/items.json', 'utf8', (err, data) => {
            if (err) {
                reject(err);
            } else {
                posts = JSON.parse(data);

                fs.readFile('./data/categories.json', 'utf8', (err, data) => {
                    if (err) {
                        reject(err);
                    } else {
                        categories = JSON.parse(data);
                        resolve();
                    }
                });
            }
        });
    });
}

// GETALLITEMS
function getAllItems(){
    return new Promise((resolve, reject)=>{
        (posts.length > 0 ) ? resolve(posts) : reject("no results returned"); 
    });
}

// GETPUBLISHEDITEMS
function getPublishedItems(){
    return new Promise((resolve, reject)=>{
        (items.length > 0) ? resolve(items.filter(item => items.published)) : reject("no results returned");
    });
}

// GETCATEGORIES
function getCategories(){
    return new Promise((resolve, reject)=>{
        (categories.length > 0 ) ? resolve(categories) : reject("no results returned"); 
    });
}

// ADDITEM
function addItem(itemData){
    return new Promise((resolve,reject)=>{
        // check if published is true or not. 
        itemData.published = itemData.published ? true : false;

        // increase the Id by 1, for our 'index'
        itemData.id = items.length + 1;

        // push the item to the dataStore
        items.push(itemData);

        // resolve the promise
        resolve();
    });
}

//GETITEMSBYCATEGORY
function getItemsByCategory(category){
    return new Promise((resolve,reject)=>{
        let filteredItems = items.filter(post=>post.category == category);

        if(filteredItems.length == 0){
            reject("no results returned")
        }else{
            resolve(filteredItems);
        }
    });
}

//GETITEMSBYMINDATE
function getItemsByMinDate(minDateStr){
    return new Promise((resolve, reject) => {
        let filteredItems = items.filter(post => (new Date(post.postDate)) >= (new Date(minDateStr)))

        if (filteredItems.length == 0) {
            reject("no results returned")
        } else {
            resolve(filteredItems);
        }
    });
}

//GETPUBLISHEDITEMSBYCATEGORY
function getPublishedItemsByCategory(category){
    return new Promise((resolve, reject)=>{
        if(items.length > 0 && items.category == category){
            resolve(items.filter(item => items.published && items.categories == category));
        }else{
            reject("no results returned");
        }
    });
}

/** EXPORTING THE MODULES **/
module.exports = {
    initialize,
    getAllItems,
    getPublishedItems,
    getCategories,
    addItem,
    getItemsByCategory,
    getItemsByMinDate,
    getPublishedItemsByCategory,
};