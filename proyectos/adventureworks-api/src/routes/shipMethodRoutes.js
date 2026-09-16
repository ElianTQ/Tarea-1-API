const express = require('express');
const router = express.Router();
const controller = require('../controllers/shipMethodController');

router.get('/shipmethods', controller.getAllShipMethods);
router.post('/shipmethods', controller.createShipMethod);
router.put('/shipmethods/:id', controller.updateShipMethod);
router.delete('/shipmethods/:id', controller.deleteShipMethod);
router.get('/purchase-orders-with-vendor', controller.getPurchaseOrdersWithVendorAndShip);

module.exports = router;