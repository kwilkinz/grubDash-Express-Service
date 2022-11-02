const path = require("path");

// Use the existing order data
const orders = require(path.resolve("src/data/orders-data"));

// Use this function to assigh ID's when necessary
const nextId = require("../utils/nextId");

// ================================================================
// GET - All Dishes 
function list(req, res) {
  res.json({ data: orders })
};

// ================================================================
// VERIFY  - 
    // DeliverTo in Postman
function verifyDeliverTo(req, res, next) {
  const { data: { deliverTo } = {} } = req.body;
  if (deliverTo){
    return next();
  }
  next({
    status: 400,
    message: `Order must include a deliverTo`,
  })
};

    // Phone numb in postman
function verifyMobileNum(req, res, next) {
  const { data: { mobileNumber } = {} } = req.body;
   if (mobileNumber){
    return next();
  }
  next({
    status: 400,
    message: `Order must include a mobileNumber`,
  })
};

    // Dishes in Postman 
function verifyDishes(req, res, next) {
   const { data: { dishes } = {} } = req.body;
   if (!dishes) {
     next({
       status: 400,
       message: `Order must include a dish`,
     })
   } else if (!Array.isArray(dishes) || dishes.length === 0 ) {
     next({
       status: 400,
       message: `Order must include at least one dish`
     })
   };
  return next();
};

    // Quantity in postman 
function verifyDishQuantity(req, res, next) {
  const { data: { dishes } = {} } = req.body;
  const index = dishes.findIndex((dish) => !dish.quantity);

  if (index >= 0) {
    next({
      status: 400,
      message: `Dish ${index} must have a quantity that is an integer greater than 0`,
    });
  }

  return next();
}


function dishQuantityIsInteger(req, res, next) {
  const { data: { dishes } = {} } = req.body;
  const index = dishes.findIndex((dish) => !Number.isInteger(dish.quantity));

  if (index >= 0) {
    next({
      status: 400,
      message: `Dish ${index} must have a quantity that is an integer greater than 0`,
    });
  }

  return next();
}


// ================================================================
    // Status in postman *********************************************************** !!!!! 
function statusCheck(req, res, next) {
  const { data: { status } = {} } = req.body;
  if(status === "pending" || status === "preparing" || status === "out-for-delivery") {
    return next();
  } 
  next({
    status: 400,
    message: `Order must have a status pending, preparing, out-for-delivery, delivered`,
  })
};

  // Check Status Pending 
function statusPending(req, res, next) {
  const { order } = res.locals;
  if (order.status === "pending") {
    return next();
  }

  next({
    status: 400,
    message: "An order cannot be deleted unless it is pending",
  });
}


// ================================================================
// POST ( CREATE ) -- newDishes
function create(req, res) {
  const { data: { deliverTo, mobileNumber, dishes } = {} } = req.body;
  const newId = nextId();
  const newOrder = {
    id: newId,
    deliverTo,
    mobileNumber,
    dishes,
  };

  orders.push(newOrder);
  res.status(201).json({ data: newOrder });
}

// ================================================================
// ************ NEW REQUEST ***************************************
// GET - specific dishId
function orderExists(req, res, next) {
  const { orderId } = req.params;
  const foundOrder = orders.find((order) => order.id === orderId);
  if (foundOrder) {
    res.locals.order = foundOrder;
    return next();
  }

  next({
    status: 404,
    message: `Order does not exist: ${orderId}`,
  });
}

// ================================================================
// GET/READ - specific data from local 
function read(req, res) {
  res.json({ data: res.locals.order });
};

// ================================================================
// PUT/UPDATE - update to local
function update(req, res, next) {
  const order = res.locals.order;
  const { orderId } = req.params;
  const { data: { id, deliverTo, mobileNumber, dishes, status } = {} } = req.body;
  if (!id || orderId === id){
    const updateOrder = {
      id: orderId,
      deliverTo,
      mobileNumber, 
      dishes,
      status,
    }
    res.json({ data: updateOrder });
  }
  next({
    status: 400,
    message: `Dish id does not match route id. Dish: ${id}, Route: ${orderId}`
  })
};

// ================================================================
// DELETE  
function destroy(req, res, next) {
  const { orderId } = req.params; 
  const index = orders.findIndex((order) => order.id === orderId);
  if (index > -1) {
    orders.splice(index, 1);
  }
  res.sendStatus(204);
};


// ================================================================
module.exports = {
  list,
  create: [
    verifyDeliverTo,
    verifyMobileNum,
    verifyDishes,
    verifyDishQuantity,
    dishQuantityIsInteger,
    create,
  ],
  read: [orderExists, read],
  update: [
    orderExists,
    verifyDeliverTo,
    verifyMobileNum,
    verifyDishes,
    verifyDishQuantity,
    dishQuantityIsInteger,
    statusCheck,
    update,
  ],
  delete: [orderExists, statusPending, destroy],
}
