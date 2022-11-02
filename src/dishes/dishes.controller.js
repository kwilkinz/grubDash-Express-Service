const path = require("path");

// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

// ================================================================
// GET - All Dishes 
function list(req, res) {
  res.json({ data: dishes })
};

// ================================================================
// VERIFY  - 
    // Name in Postman
function verifyName(req, res, next) {
  const { data: { name } = {} } = req.body;
  if (name){
    return next();
  }
  next({
    status: 400,
    message: `Dish must include a name`,
  })
};

    // Description in postman
function verifyDescription(req, res, next) {
  const { data: { description } = {} } = req.body;
  if (description){
    return next();
  }
  next({
    status: 400,
    message: `Dish must include a description`,
  })
};

    // Price in Postman 
function verifyPrice(req, res, next) {
  const { data: { price } = {} } = req.body;
  if (!price) {
    return next({
      status: 400,
      message: `Dish must include a price.`
    });
  } else if (price <= 0 || !Number.isInteger(price)) {
    next({
      status: 400,
      message: `Dish must have a price that is an integer greater than 0`,
    })
  }
  return next();
};

    // Image_url in postman 
function verifyImage(req, res, next) {
  const { data: { image_url } = {} } = req.body;
  if (image_url) {
      return next();
  } 
    next({
      status: 400,
      message: `Dish must include a image_url`,
    })
};

// ================================================================
// POST ( CREATE ) -- newDishes
function create(req, res, next) {
  const { data: { name, description, price, image_url } = {} } = req.body;
  const generateId = nextId();
  const newDishes = {
    id: generateId, 
    name,
    description,
    price, 
    image_url,
  };
  dishes.push(newDishes);
  res.status(201).json({ data: newDishes })
};

// ================================================================
// ************ NEW REQUEST ***************************************
// GET - specific dishId
function dishExists(req, res, next) {
  const { dishId } = req.params;
  const foundDish = dishes.find((dish) => dish.id === dishId);
  if (foundDish) {
    res.locals.dish = foundDish;
    return next();
  }

  next({
    status: 404,
    message: `Dish does not exist: ${dishId}`,
  });
}

// ================================================================
// GET/READ - specific data from local 
function read(req, res) {
  res.json({ data: res.locals.dish });
};

// ================================================================
// PUT/UPDATE - update to local
function update(req, res, next) {
  const dish = res.locals.dish;
  const { dishId } = req.params;
  const { data: { id, name, description, price, image_url } = {} } = req.body;
  if (!id || dishId === id){
    const updateDish = {
      id: dishId,
      name,
      description, 
      price,
      image_url,
    }
    res.json({ data: updateDish });
  }
  next({
    status: 400,
    message: `Dish id does not match route id. Dish: ${id}, Route: ${dishId}`
  })
}

// ================================================================

module.exports = {
  list,
  create: [
    verifyName,
    verifyDescription,
    verifyPrice,
    verifyImage,
    create
  ],
  read: [dishExists, read], 
  update: [
    dishExists,
    verifyName,
    verifyDescription,
    verifyPrice,
    verifyImage,
    update
  ],
};

