'use strict';

/**
 * cached reading of inputs
 */

const request = require('request');
const mysql = require('mysql');

const config = require('../config');

const GET_MOVIES = '/discover/movie';
const GET_TV = '/discover/tv';
const MOVIE_PREFIX = '/movie/';
const TV_PREFIX = '/tv/';
const CREDITS_POSTFIX = '/credits';
const START_DATE = '2019-03-01';
const END_DATE = '2019-03-31';

const API_DELAY = 500;

const GET_MOVIES_URL = config.movie_api.base_url + GET_MOVIES + '?api_key=' 
+ config.movie_api.api_key + '&primary_release_date.gte=' + START_DATE
+ '&primary_release_date.lte='  + END_DATE;

const GET_TVSHOWS_URL = config.movie_api.base_url + GET_TV + '?api_key=' 
+ config.movie_api.api_key + '&first_air_date.gte=' + START_DATE
+ '&first_air_date.lte='  + END_DATE;

const movies = [];
const tvshows = [];

const actorsOnMovie = new Map(); // actor -> movie
const actorsOnTV = new Map(); // actor -> tv show


const Inputs = {

  init: () => {
    return new Promise(function(resolve, reject) {
      // mysql setup
      const db = mysql.createConnection(config.db);
      global.db = db;
      
      // connect to database and create schema if needed
      db.connect((err) => {
        if (err) {
          console.error(err);
          process.exit(1);
        }
        db.query(
          'CREATE SCHEMA IF NOT EXISTS `squarepanda` DEFAULT CHARACTER SET utf8;'
          + 'USE `squarepanda`;'
          + 'create table if not exists `cache` (`query` varchar(2048) not null, result json null,primary key (`query`)) engine=InnoDB',
          (err) =>  {
            if (err) {
              console.error(err);
              process.exit(1);
            }
            resolve();
          }
        );
      });
    });
  },

  getMovies: () => {
    return getAPIItems(
      GET_MOVIES_URL,
      movies,
    );
  },

  getTVShows: () => {
    return getAPIItems(
      GET_TVSHOWS_URL,
      tvshows,
    );
  },


  getMovieCredits: () => {
    return getCredits(
      MOVIE_PREFIX,
      movies,
      actorsOnMovie,
    );
  },

  getTVCredits: () => {
    return getCredits(
      TV_PREFIX,
      tvshows,
      actorsOnTV,
    );
  },

  getAllInfo: () => {
    return Inputs.init()
    .then(Inputs.getMovies)
    .then(Inputs.getTVShows)
    .then(Inputs.getMovieCredits)
    .then(Inputs.getTVCredits);
  },

  getMovieActors: () => { return actorsOnMovie; },
  getTVActors: () => { return actorsOnTV; },
}

// get all movie/tv show detail
function getAPIItems(baseUrl, a, requestPage = 1) {
  return new Promise(function(resolve, reject) {
    getAPIItemCached(baseUrl, a, requestPage)
    .then((itemsToProcess) => {
      // more pages available? then continue processing
      if (itemsToProcess > 0) {
        return resolve(getAPIItems(baseUrl, a, requestPage + 1));
      }
      resolve(a);
    });
  });
}

// get one page of movie or tv show information (helper for getAPIItems)
function getAPIItemCached(baseUrl, a, requestPage) {
  return new Promise(function(resolve, reject) {
    const url = baseUrl + '&page=' + requestPage;
    cachedRequest(url)
    .then((data) => {
      const doc = JSON.parse(data);
      storeDetail(doc.results, a);
      return resolve(doc.total_pages - requestPage);
    });
  });
}

// get all credits for a movie or tv show
function getCredits(prefix, a, m) {
  return new Promise(function(resolve, reject) {
    getCreditCached(prefix, a, m)
    .then(() => {
      if (a.length) {
        return resolve(getCredits(prefix, a, m));
      }
      resolve(m);
    });
  });
}

// get one cached credit (helper for getCredits)
function getCreditCached(prefix, a, m) {
  return new Promise(function(resolve, reject) {
    if (!a.length) { return resolve(a); }
    const id = a.pop();
    const url = config.movie_api.base_url + prefix + id + CREDITS_POSTFIX + '?api_key=' + config.movie_api.api_key;
    cachedRequest(url)
    .then((data) => {
      const doc = JSON.parse(data);
      storeToMap(doc.cast, m);
      return resolve(doc);
    });
  });
}

// make a url request that is cached in a local database
function cachedRequest(url) {
  return new Promise(function(resolve, reject) {
    // check cache first
    db.query('select result from cache where query = ?', [url], (err, data) => {
      if (err) { return reject(err); }
      if (data.length) { 
        return resolve(data[0].result); 
      } 
      // not in cache, get it from the API instead
      // set time out due to API throttling requirements
      setTimeout(() => { 
        request(url, function (err, response, body) {
          if (err) { return reject(err); }
          if (response.statusCode < 200 || response.statusCode > 299) { 
            return reject(body); // body contains the best error message
          }
          // insert into cache
          db.query('insert into `cache` (`query`, `result`) values(?,?)', [url, body], () => {});
          return resolve(body);
        });
      }, API_DELAY);
    });
  });
}


function storeDetail(result, a) {
  for (let item of result) {
    a.push(item.id);
  }
}

function storeToMap(result, m) {
  for (let item of result) {
    m[item.id] = item;
  }
}

module.exports = Inputs;
