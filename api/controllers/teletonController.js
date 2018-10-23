'use strict'

var Teleton = require('../models/teletonModel');
var XLSX = require('xlsx');

exports.detalleCrit = (req, res) => {
    var idCrit = req.body.id;
    Teleton.obtenerCrit(idCrit, (error, result) => {
        console.log(result);
        if (error) {
            console.log(error);
            res.status(500).send({
                code: 3,
                message: "Ocurrió un error al realizar la consulta",
                data: error
            })
        }
        else if (result.length == 0) {
            res.status(200).send({
                code: 2,
                message: "No hay Crit en este estado.",
                data: error
            })
        }
        else {
            var monto = 0;
            for (var i = 0; i < result.length; i++) {
                monto = monto + result[i].monto;
            }
            var datos = {
                "Recursos_Necesarios": "",
                "Total_ninos": "",
                "Ninos_protegidos": "",
                "Acumulado": monto,
                "Banamex": result[0].monto,
                "Farmacias": result[1].monto,
                "Soriana": result[2].monto,
                "Telcel": result[3].monto,
                "Telecomm": result[4].monto,
                "Telmex": result[5].monto
            }
            Teleton.obtenerMetadatos(idCrit, monto, (error, result) => {
                if (error) {
                    console.log(error);
                    res.status(500).send({
                        code: 3,
                        message: "Ocurrió un error al realizar la consulta",
                        data: error
                    })
                }
                else {
                    datos.Recursos_Necesarios = result[0].recursosNecesarios;
                    datos.Total_ninos = result[0].ninosTotal;
                    datos.Ninos_protegidos = result[0].ninosCubiertos;
                    res.status(200).send({
                        code: 1,
                        data: datos
                    })
                }
            })
        }
    })
}

exports.extractorBanamex = (req, res) => {
    const fs = require('fs');
    const dir = './teleton2016/2016/Banamex';

    fs.readdir(dir, (err, files) => {
        var cantidad = files.length;
        if (cantidad == 0) {
            res.status(200).send({
                code: 1,
                message: "No hay archivos a procesar."
            })
        }
        else {
            //console.log('entre1');
            var file = files[cantidad - 1]
            var workbook = XLSX.readFile('teleton2016/2016/Banamex/' + file);
            var sheet_name_list = workbook.SheetNames;
            sheet_name_list.forEach(function (y) {
                var worksheet = workbook.Sheets[y];
                var headers = {};
                var data = [];
                for (var z in worksheet) {
                    if (z[0] === '!') continue;
                    //parse out the column, row, and value
                    var col = z.substring(0, 1);
                    var row = parseInt(z.substring(1));
                    var value = worksheet[z].v;

                    //store header names
                    if (row == 1) {
                        headers[col] = value;
                        continue;
                    }

                    if (!data[row]) data[row] = {};
                    data[row][headers[col]] = value;
                }
                //drop those first two rows which are empty
                data.shift();
                data.shift();
                Teleton.obtenerContador((error, result) => {
                    var contador = result[0].contador;
                    for (var i = contador; i < data.length; i++) {
                        var registro = {
                            "monto": data[i].Monto,
                            "canal": "Banamex",
                            "donaciones": 1
                        }
                        Teleton.insertarDonacion(registro, (error, result) => {
                            console.log("Inserta registro Banamex");
                            if (error) {
                                console.log(error);
                                res.status(500).send({
                                    code: 3,
                                    message: "Ocurrió un error al realizar la consulta",
                                    data: error
                                })
                            }
                            else {
                                console.log("Registro exitoso");
                            }
                        })
                        //console.log(i)
                    }
                    Teleton.actualizarContadoranamex(data.length, (error, result) => {
                        if (error) {
                            console.log(error);
                            res.status(500).send({
                                code: 3,
                                message: "Ocurrió un error al realizar la consulta",
                                data: error
                            })
                        }
                        else {
                            console.log("Actualización contador");
                        }
                    })
                })
                //console.log(data[0]);
            });
            fs.unlinkSync('teleton2016/2016/Banamex/' + file);
            res.status(200).send({
                code: 1,
                message: "Extracción de BANAMEX exitosa."
            })
        }
    });
}

exports.extractorFarmacias = (req, res) => {
    const fs = require('fs');
    const dir = './teleton2016/2016/FarmaciasAhorro';

    fs.readdir(dir, (err, files) => {
        var cantidad = files.length;
        if (cantidad == 0) {
            res.status(200).send({
                code: 1,
                message: "No hay archivos a procesar."
            })
        }
        else {
            for (var j = 0; j < cantidad; j++) {
                var file = files[j /*- 1*/];
                console.log(file);
                var workbook = XLSX.readFile('teleton2016/2016/FarmaciasAhorro/' + file);
                var sheet_name_list = workbook.SheetNames;
                sheet_name_list.forEach(function (y) {
                    var worksheet = workbook.Sheets[y];
                    var headers = {};
                    var data = [];
                    for (var z in worksheet) {
                        if (z[0] === '!') continue;
                        //parse out the column, row, and value
                        var col = z.substring(0, 1);
                        var row = parseInt(z.substring(1));
                        var value = worksheet[z].v;

                        //store header names
                        if (row == 1) {
                            headers[col] = value;
                            continue;
                        }

                        if (!data[row]) data[row] = {};
                        data[row][headers[col]] = value;
                    }
                    //drop those first two rows which are empty
                    data.shift();
                    data.shift();
                    for (var i = 0; i < data.length; i++) {
                        var registro = {
                            "monto": data[i].total,
                            "canal": "Farmacias",
                            "donaciones": data[i]['No. De Movimientos']
                        }
                        Teleton.insertarDonacion(registro, (error, result) => {
                            console.log("Inserta registro Farmacias");
                            if (error) {
                                console.log(error);
                                res.status(500).send({
                                    code: 3,
                                    message: "Ocurrió un error al realizar la consulta",
                                    data: error
                                })
                            }
                            else {
                                console.log("Registro exitoso");
                                //console.log(result);
                            }
                        })
                        //console.log(i)
                    }
                    //console.log(data[0]);
                });
                fs.unlinkSync('teleton2016/2016/FarmaciasAhorro/' + file);
            }
            res.status(200).send({
                code: 1,
                message: "Registro de Farmacias exitoso."
            })
        }
    });
}

exports.extractorSoriana = (req, res) => {
    const fs = require('fs');
    const dir = './teleton2016/2016/Soriana';

    fs.readdir(dir, (err, files) => {
        var cantidad = files.length;
        if (cantidad == 0) {
            res.status(200).send({
                code: 1,
                message: "No hay archivos a procesar."
            })
        }
        else {
            for (var j = 0; j < cantidad; j++) {
                var file = files[j];
                console.log(file);
                var workbook = XLSX.readFile('teleton2016/2016/Soriana/' + file);
                var sheet_name_list = workbook.SheetNames;
                sheet_name_list.forEach(function (y) {
                    var worksheet = workbook.Sheets[y];
                    var headers = {};
                    var data = [];
                    for (var z in worksheet) {
                        if (z[0] === '!') continue;
                        //parse out the column, row, and value
                        var col = z.substring(0, 1);
                        var row = parseInt(z.substring(1));
                        var value = worksheet[z].v;

                        //store header names
                        if (row == 1) {
                            headers[col] = value;
                            continue;
                        }

                        if (!data[row]) data[row] = {};
                        data[row][headers[col]] = value;
                    }
                    //drop those first two rows which are empty
                    data.shift();
                    data.shift();
                    var tempo;
                    var tempo2;
                    for (var i = 3; i < data.length - 1; i++) {
                        if (data[i]) {
                            tempo = (data[i]['FECHA|TIENDA|DONADORES|IMPORTE']);
                            tempo2 = String(data[i]['undefined']);
                            tempo = tempo.split("|");
                            tempo2 = tempo2.split(".");
                            var registro = {
                                "monto": (tempo2[1]) ? tempo[3] + '.' + tempo2[1] : tempo[3],
                                "canal": "Soriana",
                                "donaciones": tempo[2]
                            }
                            Teleton.insertarDonacion(registro, (error, result) => {
                                console.log("Inserta registro Soriana");
                                if (error) {
                                    console.log(error);
                                    res.status(500).send({
                                        code: 3,
                                        message: "Ocurrió un error al realizar la consulta",
                                        data: error
                                    })
                                }
                                else {
                                    console.log("Registro exitoso");
                                    //console.log(result);
                                }
                            })
                        }
                        //console.log(i)
                    }
                    //console.log(data[0]);
                });
                fs.unlinkSync('teleton2016/2016/Soriana/' + file);
            }
            res.status(200).send({
                code: 1,
                message: "Registro de Soriana exitoso."
            })
        }
    });
}

exports.extractorTelecomm = (req, res) => {
    const fs = require('fs');
    const dir = './teleton2016/2016/Telecomm';

    fs.readdir(dir, (err, files) => {
        var cantidad = files.length;
        var file = files[cantidad - 1]
        if (cantidad == 0) {
            res.status(200).send({
                code: 1,
                message: "No hay archivos a procesar."
            })
        }
        else {
            for (var j = 0; j < cantidad; j++) {
                var file = files[j];
                console.log(file);
                var workbook = XLSX.readFile('teleton2016/2016/Telecomm/' + file);
                var sheet_name_list = workbook.SheetNames;
                sheet_name_list.forEach(function (y) {
                    var worksheet = workbook.Sheets[y];
                    var headers = {};
                    var data = [];
                    for (var z in worksheet) {
                        if (z[0] === '!') continue;
                        //parse out the column, row, and value
                        var col = z.substring(0, 1);
                        var row = parseInt(z.substring(1));
                        var value = worksheet[z].v;

                        //store header names
                        if (row == 1) {
                            headers[col] = value;
                            continue;
                        }

                        if (!data[row]) data[row] = {};
                        data[row][headers[col]] = value;
                    }
                    //drop those first two rows which are empty
                    data.shift();
                    data.shift();
                    for (var i = 0; i < data.length; i++) {
                        var registro = {
                            "monto": data[i].Monto,
                            "canal": "Telecomm",
                            "donaciones": data[i].Donadores
                        }
                        console.log(registro);
                        Teleton.insertarDonacion(registro, (error, result) => {
                            console.log("Inserta registro Telecomm");
                            if (error) {
                                console.log(error);
                                res.status(500).send({
                                    code: 3,
                                    message: "Ocurrió un error al realizar la consulta",
                                    data: error
                                })
                            }
                            else {
                                console.log("Registro exitoso");
                                //console.log(result);
                            }
                        })
                        //console.log(i)
                    }
                    //console.log(data[0]);
                });
                fs.unlinkSync('teleton2016/2016/Telecomm/' + file);
            }
            res.status(200).send({
                code: 1,
                message: "Registro de Farmacias exitoso."
            })
        }
    });
}

exports.extractorTelmex = (req, res) => {
    const fs = require('fs');
    const dir = './teleton2016/2016/Telmex';

    fs.readdir(dir, (err, files) => {
        var cantidad = files.length;
        var file = files[cantidad - 1]
        if (cantidad == 0) {
            res.status(200).send({
                code: 1,
                message: "No hay archivos a procesar."
            })
        }
        else {
            for (var j = 0; j < cantidad; j++) {
                var file = files[j];
                console.log(file);
                var workbook = XLSX.readFile('teleton2016/2016/Telmex/' + file);
                var sheet_name_list = workbook.SheetNames;
                sheet_name_list.forEach(function (y) {
                    var worksheet = workbook.Sheets[y];
                    var headers = {};
                    var data = [];
                    for (var z in worksheet) {
                        if (z[0] === '!') continue;
                        //parse out the column, row, and value
                        var col = z.substring(0, 1);
                        var row = parseInt(z.substring(1));
                        var value = worksheet[z].v;

                        //store header names
                        if (row == 1) {
                            headers[col] = value;
                            continue;
                        }

                        if (!data[row]) data[row] = {};
                        data[row][headers[col]] = value;
                    }
                    //drop those first two rows which are empty
                    data.shift();
                    data.shift();
                    for (var i = 0; i < data.length; i++) {
                        if (i == data.length - 1) {
                            var registro = {
                                "monto": data[i]['Importe total Acumulado'],
                                "canal": "Telmex",
                                "donaciones": data[i]['Total de LLamadas']
                            }
                            Teleton.insertarDonacion(registro, (error, result) => {
                                console.log("Inserta registro Telmex");
                                if (error) {
                                    console.log(error);
                                    res.status(500).send({
                                        code: 3,
                                        message: "Ocurrió un error al realizar la consulta",
                                        data: error
                                    })
                                }
                                else {
                                    console.log("Registro exitoso");
                                    //console.log(result);
                                }
                            })
                        }
                        //console.log(i)
                    }
                    //console.log(data[0]);
                });
                fs.unlinkSync('teleton2016/2016/Telmex/' + file);
            }
            res.status(200).send({
                code: 1,
                message: "Registro de Farmacias exitoso."
            })
        }
    });
}

exports.extractorTelcel = (req, res) => {
    const fs = require('fs');
    const dir = './teleton2016/2016/Telcel';

    fs.readdir(dir, (err, files) => {
        var cantidad = files.length;
        var file = files[cantidad - 1]
        if (cantidad == 0) {
            res.status(200).send({
                code: 1,
                message: "No hay archivos a procesar."
            })
        }
        else {
            for (var j = 0; j < cantidad; j++) {
                var file = files[j];
                console.log(file);
                var workbook = XLSX.readFile('teleton2016/2016/Telcel/' + file);
                var sheet_name_list = workbook.SheetNames;
                sheet_name_list.forEach(function (y) {
                    var worksheet = workbook.Sheets[y];
                    var headers = {};
                    var data = [];
                    for (var z in worksheet) {
                        if (z[0] === '!') continue;
                        //parse out the column, row, and value
                        var col = z.substring(0, 1);
                        var row = parseInt(z.substring(1));
                        var value = worksheet[z].v;

                        //store header names
                        if (row == 1) {
                            headers[col] = value;
                            continue;
                        }

                        if (!data[row]) data[row] = {};
                        data[row][headers[col]] = value
                    }
                    //drop those first two rows which are empty
                    data.shift();
                    data.shift();
                    var tempo;
                    var tempo2;
                    var monto = "";
                    tempo = String(data[7]['-----------------------------------------------------------------------------------------------------------------------------------']);
                    tempo = tempo.split(":");
                    tempo2 = tempo[2].split(",");
                    tempo = tempo[1].split(" ")
                    for (var i = 0; i < tempo2.length; i++) {
                        monto = monto + tempo2[i];
                    }

                    var registro = {
                        "monto": monto,
                        "canal": "Telcel",
                        "donaciones": tempo[1]
                    }
                    Teleton.insertarDonacion(registro, (error, result) => {
                        console.log("Inserta registro Telcel");
                        if (error) {
                            console.log(error);
                            res.status(500).send({
                                code: 3,
                                message: "Ocurrió un error al realizar la consulta",
                                data: error
                            })
                        }
                        else {
                            console.log("Registro exitoso");
                            //console.log(result);
                        }
                    })
                });
                fs.unlinkSync('teleton2016/2016/Telcel/' + file);
            }
            res.status(200).send({
                code: 1,
                message: "Registro de Farmacias exitoso."
            })
        }
    });
}

