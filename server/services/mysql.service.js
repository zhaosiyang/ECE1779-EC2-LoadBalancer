const Sequelize = require('sequelize');
import {mysqlCredential} from '../config';
import * as bcrypt from 'bcryptjs';

export class MysqlService {

  static config() {
    this.sql = new Sequelize(`mysql://${mysqlCredential.username}:${mysqlCredential.password}@${mysqlCredential.url}/ece1779a1`);
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
    this._models.AdminConfig = this.sql.define('ADMIN_CONFIGS', {
      autoScale: {type: Sequelize.BOOLEAN},
      cpuExpandingThreshold: {type: Sequelize.INTEGER},
      cpuShrinkingThreshold: {type: Sequelize.INTEGER},
      expandingRatio: {type: Sequelize.INTEGER},
      shrinkingRatio: {type: Sequelize.INTEGER}
    });
    const User = MysqlService.models.User;
    const Image = MysqlService.models.Image;
    const AdminConfig = MysqlService.models.AdminConfig;
    User.sync().then(function () {
        console.log('USERS table created');
        // return User.create({
        //     username: 'admin',
        //     password: 'admin'
        // });
    }).then(function () {
        return Image.sync().then(function () {
            console.log('IMAGES table created');
        });
    }).then(function () {
        return AdminConfig.sync().then(function () {
          console.log('AdminConfig table created');
          // return AdminConfig.create({
          //   autoScale: false,
          //   cpuExpandingThreshold: 80,
          //   cpuShrinkingThreshold: 10,
          //   expandingRatio: 2,
          //   shrinkingRatio: 2
          // });
        })
    })
  }

  static get models() {
    return this._models;
  }
}




