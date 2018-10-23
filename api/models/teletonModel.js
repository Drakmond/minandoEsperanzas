'use strict'

const connection = require('../../db');
var Teleton = {}

Teleton.obtenerContador = (callback) => {
    connection.query("SELECT contador FROM ht_contador_banamex WHERE id = 1", (error, result, fields) => {
        callback(error, result);
    })
}

Teleton.obtenerCrit = (id, callback) => {
    connection.query("SELECT SUM(ht_dispersiones.monto) AS monto, canal FROM ht_crits INNER JOIN ht_dispersiones ON ht_crits.id = idCrit INNER JOIN ht_donaciones ON ht_donaciones.id = idDonativo WHERE ht_crits.idMapa = ? GROUP BY canal", [id], (error, result, fields)=> {
        callback(error, result);
    })
}

Teleton.obtenerMetadatos = (id, monto, callback) => {
    connection.query("SELECT recursosNecesarios, ninosTotal, (?/costoNino) AS ninosCubiertos FROM ht_crits WHERE idMapa = ?", [monto, id], (error, result, fields)=> {
        callback(error, result);
    })
}

Teleton.insertarDonacion = (data, callback) => {
    connection.getConnection((err, conn) => {
        conn.beginTransaction((err, resT) => {
            if (err) callback(err);
            var idDonativo;
            conn.query("INSERT INTO ht_donaciones SET ?", [data], (error, result, fields) => {
                if (error) {
                    console.log(error);
                    conn.rollback((error) => { callback(err) });
                }
                idDonativo = result.insertId;
                var donativo = [
                    [parseInt(idDonativo), 1, parseInt(data.monto * 0.0090)],
                    [parseInt(idDonativo), 2, parseInt(data.monto * 0.0115)],
                    [parseInt(idDonativo), 3, parseInt(data.monto * 0.0124)],
                    [parseInt(idDonativo), 4, parseInt(data.monto * 0.0145)],
                    [parseInt(idDonativo), 5, parseInt(data.monto * 0.0165)],
                    [parseInt(idDonativo), 6, parseInt(data.monto * 0.0168)],
                    [parseInt(idDonativo), 7, parseInt(data.monto * 0.0176)],
                    [parseInt(idDonativo), 8, parseInt(data.monto * 0.0190)],
                    [parseInt(idDonativo), 9, parseInt(data.monto * 0.0196)],
                    [parseInt(idDonativo), 10, parseInt(data.monto * 0.0202)],
                    [parseInt(idDonativo), 11, parseInt(data.monto * 0.0204)],
                    [parseInt(idDonativo), 12, parseInt(data.monto * 0.0221)],
                    [parseInt(idDonativo), 13, parseInt(data.monto * 0.0243)],
                    [parseInt(idDonativo), 14, parseInt(data.monto * 0.0256)],
                    [parseInt(idDonativo), 15, parseInt(data.monto * 0.0267)],
                    [parseInt(idDonativo), 16, parseInt(data.monto * 0.0284)],
                    [parseInt(idDonativo), 17, parseInt(data.monto * 0.0298)],
                    [parseInt(idDonativo), 18, parseInt(data.monto * 0.0319)],
                    [parseInt(idDonativo), 19, parseInt(data.monto * 0.0322)],
                    [parseInt(idDonativo), 20, parseInt(data.monto * 0.0546)],
                    [parseInt(idDonativo), 21, parseInt(data.monto * 0.0579)],
                    [parseInt(idDonativo), 22, parseInt(data.monto * 0.0776)],
                    [parseInt(idDonativo), 23, parseInt(data.monto * 0.0792)],
                    [parseInt(idDonativo), 24, parseInt(data.monto * 0.3319)],
                ];
                conn.query("INSERT INTO ht_dispersiones (idDonativo, idCrit, monto) VALUES ?", [donativo], (error, result, fileds) => {
                    if (error) {
                        console.log(error);
                        conn.rollback((error) => { callback(err) });
                    }
                    conn.commit((error) => {
                        if (error) {
                            console.log('Error al hacer la transacción');
                            conn.rollback(callback(error));
                        }
                        //console.log('Transacción completada');
                        conn.release();
                    })
                })
                callback(error, result);
            })
        })
    })
}

Teleton.actualizarContadoranamex = (contador, callback) => {
    connection.getConnection((err, conn) => {
        conn.beginTransaction((err, resT) => {
            if (err) callback(err);
            conn.query("UPDATE ht_contador_banamex SET contador = ? WHERE id = 1", [contador], (error, result, fields) => {
                if (error) {
                    console.log(error);
                    conn.rollback((error) => { callback(err) });
                }
                conn.commit((error) => {
                    if (error) {
                        console.log('Error al hacer la transacción');
                        conn.rollback(callback(error));
                    }
                    //console.log('Transacción completada');
                    conn.release();
                })
            })
        })
    })
}

module.exports = Teleton;