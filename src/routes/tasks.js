// src/routes/tasks.js
const router = require("express").Router();
const ctrl = require("../controllers/taskController");
const requireAuth = require("../middleware/auth");

router.use(requireAuth);

router.get("/", ctrl.getAll);
router.get("/:id", ctrl.getOne);
router.post("/", ctrl.create);
router.put("/:id", ctrl.update);
router.delete("/:id", ctrl.remove);

module.exports = router;
