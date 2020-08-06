var express = require('express');
var router = express.Router();

const mysql = require('mysql2/promise')
const Pool = require('../utils/mysql')

/* GET users listing. */
router.get('/', async function(req, res, next) {
    const connection = await Pool.getConnection();
    const [results] = await connection.query('SELECT * FROM test.money;')
    console.log(results)
    res.json({status:200,arr:results})
    connection.release()
    // conn

});

module.exports = router;
