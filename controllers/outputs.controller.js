'use strict';

const express = require('express');
const url = require('url');

const {ReE, ReS, ReO} = require('../services/util.service');
const Answers = require('../models/answers');

const router = express.Router();


function answer(req, res, next) {
  const output = {answer: Answers.getAnswer()};
  ReO(res, output, 200);
}
module.exports.answer = answer;