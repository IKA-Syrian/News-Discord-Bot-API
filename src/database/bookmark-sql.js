const mysql = require("mysql2")

module.exports = mysql.createPool({
    host: "vmi537769.contaboserver.net",
    user: "darkmen",
    password: "Darkteam2020top",
    database:"darkmen_goldenapi"
})