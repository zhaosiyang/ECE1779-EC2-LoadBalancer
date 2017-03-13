const Sequelize = require('sequelize');
import {mysqlCredential} from '../config';
import * as bcrypt from 'bcrypt';

export class MysqlService {

  static config() {
    this.sql = new Sequelize(`mysql://${mysqlCredential.username}:${mysqlCredential.password}@localhost/ece1779a1`);
    this._configModels();
  }

  static _configModels() {
    this._models = this._models || {};
    this._models.User = this.sql.define('USERS', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      username: {
        field: 'username',
        unique: true,
        type: Sequelize.STRING
      },
      password: {
        type: Sequelize.STRING,
        field: 'password'
      }
    }, {
      hooks: {
        beforeCreate: function(user) {
          const salt = bcrypt.genSaltSync(10);
          const hash = bcrypt.hashSync(user.password, salt);
          user.dataValues.password = hash;
        }
      }
    });
    this._models.Image = this.sql.define('IMAGES', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      userId: {
        type: Sequelize.INTEGER,
        references: {
          model: this._models.User,
          key: 'id'
        }
      },
      key1: {
        type: Sequelize.STRING
      },
      key2: {
        type: Sequelize.STRING
      },
      key3: {
        type: Sequelize.STRING
      },
      key4: {
        type: Sequelize.STRING
      }
    });
    const User = MysqlService.models.User;
    const Image = MysqlService.models.Image;
    User.sync().then(function () {
        console.log('USERS table created');
        // return User.create({
        //     username: 'admin',
        //     password: 'admin'
        // });
    }).then(function () {
        return Image.sync({force: true}).then(function () {
            console.log('IMAGES table created');
        });
    });
  }

  static get models() {
    return this._models;
  }
}




