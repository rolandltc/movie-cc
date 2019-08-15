'use strict';

/**
 * calculates answer by querying movie db and provides cached answer on demand
 */

const request = require('request');
const mysql = require('mysql');

const config = require('../config');
const Inputs = require('./inputs');


let answer;


const Answers = {  
  calculateAnswer: () => {
    return new Promise(function(resolve, reject) {  
      Inputs.getAllInfo()
      .then(() => { 
        const movieActors = Inputs.getMovieActors();
        const tvActors = Inputs.getTVActors();
        answer = 0;
        for (let actor in movieActors) {
          if (movieActors.hasOwnProperty(actor)) {
            if (tvActors.hasOwnProperty(actor)) {
              answer++;
            }
          }
        }
        resolve(answer);
      })
      .catch((err) => {
        reject(err);
      });
    });
  },

  getAnswer: () => {
    return answer;
  },
}

module.exports = Answers;
