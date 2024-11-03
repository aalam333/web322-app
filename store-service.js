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
    return new Promise((resolve, reject)=>{
        try{
            (itemData.published === null) ? itemData.published = false : itemData.published = true;
            itemData.id = posts.length + 1;
            posts.push(itemData);
            resolve(itemData);
        }catch(err){
            reject(err);
        }
    })
}

/** EXPORTING THE MODULES **/
module.exports = {
    initialize,
    getAllItems,
    getPublishedItems,
    getCategories,
    addItem,
};