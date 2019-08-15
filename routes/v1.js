'use strict';

const express = require('express');
const router = express.Router();

const config = require('../config');
const OutputController = require('../controllers/outputs.controller');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.json({
    status:"success", 
    message:"SquarePanda API", 
    data:{"version_number":"v1.0.0",
  }})
});

router.get(   '/answer',                            OutputController.answer);       // R

module.exports = router;
