var express = require('express');
var router = express.Router();
var crypto = require('crypto')
const Pool = require('../utils/mysql');
const jwt = require('jsonwebtoken')
const { compileClientWithDependenciesTracked } = require('jade');
const { pool } = require('../utils/mysql');
require('dotenv').config()

/* GET users listing. */


module.exports = router;

router.get('/:id', async function(req, res, next) {
  const token= req.headers['x-access-token']
  try {
    const playload= jwt.verify(token,process.env.JWT_SECRET)
    const userID = req.params.id;
    const connection = await Pool.getConnection();
  try{
    const [results] = await connection.query('SELECT * FROM test.USER_TB WHERE id = ?',[userID])
    console.log(results)
    res.json({status:200,arr:results})
    connection.release()
  }catch(err){
    console.log(err)
    res.json({status:500,arr:"ERROR!"})
  }
  }catch(err){
    console.log(err)
    res.json({status:401,msg:"error"})
  }
  

});

router.post('/', async function(req, res, next) {
  const email = req.body.email
  const pwd = req.body.pwd 
  const connection = await Pool.getConnection();
  try{
    const randombyte = await crypto.randomBytes(64)
    const salt =randombyte.toString('base64')
    const hashedpwd = crypto.pbkdf2Sync(pwd,salt,100000,64,"SHA512")
    const hashedpwdString=hashedpwd.toString('base64')
    await connection.query("INSERT INTO test.USER_TB(email,password,password_salt) VALUES(?,?,?)",[email,hashedpwdString,salt])
    connection.release()
    res.json({status:200,msg:"success"})
  }catch(err){
    console.log(err)
    res.json({status:500,arr:"ERROR!"})
  }
});

router.post('/constk',function (req,res,next){ 
  res.json({status:500,arr:"ERROR"})
})

router.post('/login', async function(req, res, next) {
  const email = req.body.email
  const pwd = req.body.pwd 
  const connection = await Pool.getConnection();
  connection.release()
  try{
    const[users] = await connection.query("SELECT * FROM test.USER_TB WHERE email= ?",[email])
    if (users.length===0){
      return res.json({status:404, msg:"아이디가 없어요1"})
    }
    const user = users[0]
    const hashedpwd = user.password
    const salt = user.password_salt
    if (crypto.pbkdf2Sync(pwd,salt,100000,64,"SHA512").toString("base64")!==hashedpwd){
      return res.json({status:404, msg:"비번이 일치하지 않아요"})
    }
    const payload = {id: user.id}
    const token =jwt.sign(payload,process.env.JWT_SECRET)
    res.json({status:200,msg:token})
  }catch(err){
    console.log(err)
    res.json({status:500,arr:"ERROR!"})
  }
});
