const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
var authenticate = require('../authenticate');
const cors = require('./cors');

const Favorites = require('../models/favorite');

const favoriteRouter = express.Router();

favoriteRouter.use(bodyParser.json());

favoriteRouter
  .route('/')
  .all(authenticate.verifyUser)
  .options(cors.corsWithOptions, (req, res) => {
    res.sendStatus(200);
  })
  .get(cors.corsWithOptions, (req, res, next) => {
    Favorites.findOne({ user: req.user._id })
      .populate('user')
      .populate('dishes')
      .then(
        favorites => {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.json(favorites);
        },
        err => next(err)
      )
      .catch(err => next(err));
  })
  .post(cors.corsWithOptions, (req, res, next) => {
    Favorites.findOne({ user: req.user._id })
      .then(
        favorite => {
          if (favorite != null) {
            for (var i = 0; i < req.body.length; i++) {
              if (favorite.dishes.indexOf(req.body[i]._id) === -1) {
                favorite.dishes.push(req.body[i]._id);
              }
            }
            favorite.save().then(
              favorite => {
                console.log('Favorite Created ', favorite);
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favorite);
              },
              err => next(err)
            );
          } else {
            Favorites.create({ user: req.user._id, dishes: req.body })
              .then(
                favorite => {
                  console.log('Favorite Created ', favorite);
                  res.statusCode = 200;
                  res.setHeader('Content-Type', 'application/json');
                  res.json(favorite);
                },
                err => next(err)
              )
              .catch(err => next(err));
          }
        },
        err => next(err)
      )
      .catch(err => next(err));
  })
  .put(cors.corsWithOptions, (req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /favorites');
  })
  .delete(cors.corsWithOptions, (req, res, next) => {
    Favorites.findOneAndRemove({ user: req.user._id })
      .then(
        favorite => {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.json(favorite);
        },
        err => next(err)
      )
      .catch(err => next(err));
  });

favoriteRouter
  .route('/:dishId')
  .all(authenticate.verifyUser)
  .options(cors.corsWithOptions, (req, res) => {
    res.sendStatus(200);
  })
  .get(cors.cors, (req, res, next) => {
    res.statusCode = 403;
    res.end('GET operation not supported on /favorites/' + req.params.dishId);
  })
  .post(cors.corsWithOptions, (req, res, next) => {
    Favorites.findOne({ user: req.user._id }).then(favorite => {
      if (favorite != null) {
        if (favorite.dishes.indexOf(req.params.dishId) === -1) {
          favorite.dishes.push(req.params.dishId);
          favorite
            .save()
            .then(
              favorite => {
                console.log('Favorite Created ', favorite);
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favorite);
              },
              err => next(err)
            )
            .catch(err => next(err));
        }
      } else {
        Favorites.create({ user: req.user._id, dishes: [req.params.dishId] })
          .then(
            favorite => {
              console.log('Favorite Created ', favorite);
              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.json(favorite);
            },
            err => next(err)
          )
          .catch(err => next(err));
      }
    });
  })
  .put(cors.corsWithOptions, (req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /favorites/' + req.params.dishId);
  })
  .delete(cors.corsWithOptions, (req, res, next) => {
    Favorites.findOne({ user: req.user._id })
      .then(
        favorite => {
          if (favorite != null) {
            index = favorite.dishes.indexOf(req.params.dishId);
            if (index != -1) {
              favorite.dishes.splice(index, 1);
              favorite
                .save()
                .then(
                  favorite => {
                    console.log('Favorite Delete ', favorite);
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(favorite);
                  },
                  err => next(err)
                )
                .catch(err => next(err));
            }
          } else {
            err = new Error('Favorites not found');
            err.status = 404;
            return next(err);
          }
        },
        err => next(err)
      )
      .catch(err => next(err));
  });

module.exports = favoriteRouter;