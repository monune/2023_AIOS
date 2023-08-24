const mysql = require('mysql'); 

module.exports = function () {
    return {
      init: function () {
        return mysql.createConnection({
          host: '211.254.214.74',
          port: '3306',
          user: 'team1',
          password: 'test',
          database: 'iemh_team1'
        })
      },
      
      db_open: function (con) {
        con.connect(function (err) {
          if (err) {
            console.error('mysql connection error :' + err);
          } else {
            console.info('mysql is connected successfully.');
          }
        })
      }
    }
  };