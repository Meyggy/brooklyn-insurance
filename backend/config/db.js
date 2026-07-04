const mysql = require("mysql2/promise");
require("dotenv").config();
const db = mysql.createPool({
 host: process.env.MYSQLHOST,
 user: process.env.MYSQLUSER,
 password: process.env.MYSQLPASSWORD,
 database: process.env.MYSQL_DATABASE,
 port: process.env.MYSQLPORT,
 waitForConnections: true,
 connectionLimit: 10,
 queueLimit: 0,
});
module.exports = db;
