'use strict'

//Configuracion de la BD.

var mysql = require('mysql');
var connection = mysql.createPool({
    host:'localhost',
    user:'root',
    password:'',
    database:'teleton',
    timezone: 'utc',
    multipleStatements: true
});

//Esto no se puede hacer con un grupo de conexiones
/*
connection((err)=>{
    if(!err){
        console.log('Base de datos conectada');
    }
    else{
        console.log('No se puede conectar a la base de datos');
    }
})
*/

module.exports = connection;
