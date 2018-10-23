'use strict'
//Configuración de la aplicación
//Cargamos los módulos de express y body-parser
const express = require('express');
const bodyParser = require('body-parser');
var cors = require('cors');

//Importamos las rutas
const teletonRouter = require('./api/routes/teletonRoutes');

//Llamamos a express para poder crear el servidor
const app = express();
app.use(cors());

//Cargar middlewares
//Un metodo que se ejecuta antes que llegue a un controlador
//Configuramos bodyParser para que convierta el body de nuestras peticiones a JSON
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Cotrol-Allow-Headers', 'X-API-KEY, Origin, X-Requested-With, Content-Type, Access-Control-Request-Method');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE', 'PATCH');
    res.header('Allow', 'GET, POST , PUT, DELETE', 'OPTIONS');
  
    next();
})

//Cargamos las rutas
app.use('/api', teletonRouter);

module.exports = app;