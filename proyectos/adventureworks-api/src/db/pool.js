const sql = require('mssql');
const dbConfig = require('../config/db');

let poolPromise;

function getPool() {
  if (!poolPromise) {
    poolPromise = new sql.ConnectionPool(dbConfig)
      .connect()
      .then((pool) => {
        console.log('Conectado a SQL Server');
        return pool;
      })
      .catch((err) => {
        console.error('Error al conectar a SQL Server:', err);
        poolPromise = null;
        throw err;
      });
  }
  return poolPromise;
}

module.exports = { sql, getPool };