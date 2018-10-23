'use strict'

const express = require('express');
const Teleton = require('../controllers/teletonController');

const teletonRouter = express.Router();

teletonRouter.get('/extractorBanamex', Teleton.extractorBanamex);
teletonRouter.get('/extractorFarmacias', Teleton.extractorFarmacias);
teletonRouter.get('/extractorSoriana', Teleton.extractorSoriana);
teletonRouter.get('/extractorTelecomm', Teleton.extractorTelecomm);
teletonRouter.get('/extractorTelmex', Teleton.extractorTelmex);
teletonRouter.get('/extractorTelcel', Teleton.extractorTelcel);
teletonRouter.post('/detalleCrit', Teleton.detalleCrit);

module.exports = teletonRouter;