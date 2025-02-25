const db = require('../db/init');
const bcrypt = require('bcrypt');

class User {
  static async create(username, email, password) {
    try {
      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      
      return new Promise((resolve, reject) => {
        const sql = 'INSERT INTO users (username, email, password) VALUES (?, ?, ?)';
        db.run(sql, [username, email, hashedPassword], function(err) {
          if (err) {
            return reject(err);
          }
          resolve(this.lastID);
        });
      });
    } catch (error) {
      throw error;
    }
  }
  
  static async findByEmail(email) {
    return new Promise((resolve, reject) => {
      const sql = 'SELECT * FROM users WHERE email = ?';
      db.get(sql, [email], (err, row) => {
        if (err) {
          return reject(err);
        }
        resolve(row);
      });
    });
  }
  
  static async findById(id) {
    return new Promise((resolve, reject) => {
      const sql = 'SELECT id, username, email, created_at FROM users WHERE id = ?';
      db.get(sql, [id], (err, row) => {
        if (err) {
          return reject(err);
        }
        resolve(row);
      });
    });
  }
}

module.exports = User;