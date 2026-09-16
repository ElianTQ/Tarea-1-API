const { sql, getPool } = require('../db/pool');

async function getAllShipMethods(req, res) {
  try {
    const pool = await getPool();
    const result = await pool.request().execute('usp_ShipMethod_SelectAll');
    res.status(200).json(result.recordset);
  } catch (err) {
    res.status(500).json({ error: 'Error al consultar métodos de envío', detail: err.message });
  }
}

async function getPurchaseOrdersWithVendorAndShip(req, res) {
  try {
    const pool = await getPool();
    const result = await pool.request().execute('usp_PurchaseOrder_SelectWithVendorAndShip');
    res.status(200).json(result.recordset);
  } catch (err) {
    res.status(500).json({ error: 'Error al consultar órdenes de compra', detail: err.message });
  }
}

async function createShipMethod(req, res) {
  try {
    const { name, shipBase, shipRate } = req.body;
    if (!name || shipBase == null || shipRate == null) {
      return res.status(400).json({ error: 'Los campos "name", "shipBase" y "shipRate" son requeridos' });
    }

    const pool = await getPool();
    const result = await pool
      .request()
      .input('Name', sql.NVarChar(50), name)
      .input('ShipBase', sql.Money, shipBase)
      .input('ShipRate', sql.Money, shipRate)
      .execute('usp_ShipMethod_Insert');

    res.status(201).json({
      message: 'Método de envío creado exitosamente',
      newShipMethodId: result.recordset[0].NewShipMethodID
    });
  } catch (err) {
    res.status(500).json({ error: 'Error al insertar', detail: err.message });
  }
}

async function updateShipMethod(req, res) {
  try {
    const { id } = req.params;
    const { name, shipBase, shipRate } = req.body;
    if (!name || shipBase == null || shipRate == null) {
      return res.status(400).json({ error: 'Los campos "name", "shipBase" y "shipRate" son requeridos' });
    }

    const pool = await getPool();
    const result = await pool
      .request()
      .input('ShipMethodID', sql.Int, id)
      .input('Name', sql.NVarChar(50), name)
      .input('ShipBase', sql.Money, shipBase)
      .input('ShipRate', sql.Money, shipRate)
      .execute('usp_ShipMethod_Update');

    if (result.recordset[0].RowsAffected === 0) {
      return res.status(404).json({ error: 'Método de envío no encontrado' });
    }
    res.status(200).json({ message: 'Actualizado exitosamente' });
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar', detail: err.message });
  }
}

async function deleteShipMethod(req, res) {
  try {
    const { id } = req.params;
    const pool = await getPool();
    const result = await pool
      .request()
      .input('ShipMethodID', sql.Int, id)
      .execute('usp_ShipMethod_Delete');

    if (result.recordset[0].RowsAffected === 0) {
      return res.status(404).json({ error: 'Método de envío no encontrado' });
    }
    res.status(200).json({ message: 'Eliminado exitosamente' });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar', detail: err.message });
  }
}

module.exports = {
  getAllShipMethods,
  getPurchaseOrdersWithVendorAndShip,
  createShipMethod,
  updateShipMethod,
  deleteShipMethod
};