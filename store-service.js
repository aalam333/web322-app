/** SEQUELIZE **/
const Sequelize = require("sequelize");

var sequelize = new Sequelize("neondb", "neondb_owner", "bIZ5DyMkre4q", {
  host: "ep-square-glitter-a5fy453f-pooler.us-east-2.aws.neon.tech",
  dialect: "postgres",
  port: 5432,
  dialectOptions: {
    ssl: { rejectUnauthorized: false },
  },
  query: { raw: true },
});

/** DATA MODELS **/
// ITEM
const Item = sequelize.define("Item", {
  body: Sequelize.TEXT,
  title: Sequelize.STRING,
  itemDate: Sequelize.DATE,
  featureImage: Sequelize.STRING,
  published: Sequelize.BOOLEAN,
  price: Sequelize.DOUBLE,
});

// CATEGORY
const Category = sequelize.define("Category", {
  category: Sequelize.STRING,
});

Item.belongsTo(Category, { foreignKey: "category" });

/** MODULES **/
// INITIALIZE
module.exports.initialize = function () {
  return new Promise((resolve, reject) => {
    sequelize
      .sync()
      .then(() => {
        resolve();
      })
      .catch((err) => {
        reject("unable to sync the database");
      });
  });
};

// GETALLITEMS
module.exports.getAllItems = function () {
  return new Promise((resolve, reject) => {
    Item.findAll()
      .then((data) => {
        resolve(data);
      })
      .catch((err) => {
        reject("no results returned");
      });
  });
};

// GETITEMBYID
module.exports.getItemById = function (id) {
  return new Promise((resolve, reject) => {
    Item.findAll({
      where: {
        id: id,
      },
    })
      .then((data) => {
        resolve(data[0]);
      })
      .catch((err) => {
        reject("no results returned");
      });
  });
};

// GETPUBLISHEDITEMS
module.exports.getPublishedItems = function () {
  return new Promise((resolve, reject) => {
    Item.findAll({
      where: {
        published: true,
      },
    })
      .then((data) => {
        resolve(data);
      })
      .catch((err) => {
        reject("no results returned");
      });
  });
};

// GETCATEGORIES
module.exports.getCategories = function () {
  return new Promise((resolve, reject) => {
    Category.findAll()
      .then((data) => {
        resolve(data);
      })
      .catch((err) => {
        reject("no results returned");
      });
  });
};

// ADDITEM
module.exports.addItem = function (itemData) {
  return new Promise((resolve, reject) => {
    itemData.published = itemData.published ? true : false;

    for (field in itemData) {
      if (itemData.field == "") itemData.field == null;
    }

    itemDate = new Date();

    Item.create({
      body: itemData.body,
      title: itemData.title,
      itemDate: itemDate,
      featureImage: itemData.featureImage,
      published: itemData.published,
      price: itemData.price,
    })
      .then(() => {
        resolve();
      })
      .catch((err) => {
        reject("unable to create item");
      });
  });
};

//GETITEMSBYCATEGORY
module.exports.getItemsByCategory = function (category) {
  return new Promise((resolve, reject) => {
    Item.findAll({
      where: {
        category: category,
      },
    })
      .then((data) => {
        resolve(data);
      })
      .catch((err) => {
        reject("no results returned");
      });
  });
};

//GETITEMSBYMINDATE
module.exports.getItemsByMinDate = function (minDateStr) {
  return new Promise((resolve, reject) => {
    const { gte } = Sequelize.Op;

    Item.findAll({
      where: {
        itemDate: {
          [gte]: new Date(minDateStr),
        },
      },
    })
      .then((data) => {
        resolve(data);
      })
      .catch((err) => {
        reject("no results returned");
      });
  });
};

//GETPUBLISHEDITEMSBYCATEGORY
module.exports.getPublishedItemsByCategory = function (category) {
  return new Promise((resolve, reject) => {
    Item.findAll({
      where: {
        category: category,
        published: true,
      },
    })
      .then((data) => {
        resolve(data);
      })
      .catch((err) => {
        reject("no results returned");
      });
  });
};

//ADDCATEGORY
module.exports.addCategory = function (categoryData) {
  return new Promise((resolve, reject) => {
    for (field in categoryData) {
      if (categoryData.field == "") categoryData.field == null;
    }

    Category.create({
      category: categoryData.category,
    })
      .then(() => {
        resolve();
      })
      .catch((err) => {
        reject("unable to create category");
      });
  });
};

//DELETECATEGORYBYID
module.exports.deleteCategoryById = function (id) {
  return new Promise((resolve, reject) => {
    Category.destroy({
      where: {
        id: id,
      },
    })
      .then(() => {
        resolve();
      })
      .catch((err) => {
        reject("cannot delete category");
      });
  });
};

//DELETEITEMBYID
module.exports.deleteItemById = function (id) {
  return new Promise((resolve, reject) => {
    Item.destroy({
      where: {
        id: id,
      },
    })
      .then(() => {
        resolve();
      })
      .catch((err) => {
        reject("cannot delete item");
      });
  });
};
