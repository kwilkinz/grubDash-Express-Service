const router = require("express").Router();

const dishController = require("./dishes.controller");
const methodNotAllowed = require("../errors/methodNotAllowed");
const orderRouter = require("../orders/orders.router");

// ================================================================
// DISHES app.js holds (app.use("/dishes", dishesRouter);) 


router.route("/")
  .get(dishController.list)
  .post(dishController.create)
  .all(methodNotAllowed);


router.route("/:dishId")
  .get(dishController.read)
  .put(dishController.update)
  .all(methodNotAllowed);

// ================================================================
module.exports = router;
