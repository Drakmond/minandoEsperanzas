'use strict'

//Configuración del servidor

var app = require('./app');
var port = process.env.port || 8080;

app.listen(port, ()=>{
    console.log('Servidor funcionando por el puerto: ' + port);
})
