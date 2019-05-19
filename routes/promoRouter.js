const express = require('express');
const bodyParser = require('body-parser');

const promoRouter = express.Router();

promoRouter.use(bodyParser.json());

promoRouter.route('/')
.all((req, res, next) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    next();
})
.get((req, res, next) => {
    res.end('Will send all the promos to you');
})
.post((req, res, next) => {
    res.end('Will add the promo: ' + req.body.name +
        ' with details: ' + req.body.description);
})
.put((req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on promos');
})
.delete((req, res, next) => {
    res.end('Deleted all the promos!');
});

promoRouter.route('/:promoId')
.get((req, res, next) => {
    res.end(`Will send details about promo ${req.params.promoId} to you.`);
})
.post((req, res, next) => {
    res.statusCode = 403;
    res.end('POST operation for a specific promo is not supported');
})
.put((req, res, next) => {
    res.write('Updating the promo ' + req.params.promoId + '\n');
    res.end(`Will update promo ${req.params.promoId} with details: ${req.body.description}`);
})
.delete((req, res, next) => {
    res.end(`Deleting promo ${req.params.promoId}`);
});

module.exports = promoRouter;