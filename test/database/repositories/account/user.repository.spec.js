/* eslint-disable prefer-promise-reject-errors */
/* eslint-disable no-unused-expressions */
/* eslint-disable consistent-return */
/* eslint-disable no-undef */
process.env.NODE_ENV = 'test';

const fs = require('fs');
const { expect } = require('chai');
const User = require('../../../../app/database/repositories/account/user.repository');
const UserModel = require('../../../../app/database/models/account/user.model');
const DB = require('../../../../app/database/connection');

const readJson = (path, done) => {
  fs.readFile(require.resolve(path), (err, data) => {
    if (err) {
      done(err);
    } else {
      done(null, JSON.parse(data));
    }
  });
};

describe('User Repository Tests', () => {
  before((done) => {
    DB.open(done);
  });

  beforeEach((done) => {
    DB.drop((err) => {
      if (err) {
        return done(err);
      }
      let fixtures;
      readJson('../../../fixtures/user.model.fixture.json', (_, data) => {
        fixtures = data;
        DB.fixtures(fixtures, done);
      });
    });
  });

  it('addDevice', (done) => {
    User.all((err, users) => {
      const body = {
        pushRegistrationId: 'Registrion Id',
        cordova: 'body.cordova',
        model: 'body.model',
        platform: 'body.platform',
        uuid: 'body.uuid',
        version: 'body.version',
        manufacturer: 'body.manufacturer',
        isVirtual: 'body.isVirtual',
        serial: 'body.serial'
      };

      User.addDevice(users[0]._id, body, () => {
        User.all((_, result) => {
          expect(result[0].devices).to.exist;
          done();
        });
      });
    });
  });

  it('all', (done) => {
    User.all((err, result) => {
      result.should.not.have.property('salt');
      result.should.not.have.property('password');
      result.should.not.have.property('refreshToken');
      result.should.not.have.property('loginAttempts');
      result.should.not.have.property('lockUntil');
      result.length.should.eql(2);
      done();
    });
  });

  it('allPaged', (done) => {
    User.allPaged(0, 2, (err, result) => {
      result.should.have.length(2);
      done();
    });
  });

  it('authenticate : valid credentials', (done) => {
    User.authenticate('david@maras.co', 'Letme1n!', null, () => {
      done();
    });
  });

  it('authenticate : invalid credentials', (done) => {
    User.authenticate(
      'david@maras.co',
      'password',
      null,
      (err, data, reason) => {
        reason.should.eq(1);
        done();
      }
    );
  });

  it('byRefreshToken', (done) => {
    User.byRefreshToken(
      '77dd93db3f1455022d0a6f701c9bbd00e8b678f3',
      (err, data) => {
        data.firstName.should.eql('Antonio');
        data.lastName.should.eql('Marasco');
        done();
      }
    );
  });

  it('byRefreshToken: invalid', (done) => {
    User.byRefreshToken('123', (err, data) => {
      expect(data).to.not.exist;
      done();
    });
  });

  it('byRole', (done) => {
    User.byRole('Guest', (err, result) => {
      result.length.should.eql(1);
      result[0].firstName.should.eql('Antonio');
      result[0].lastName.should.eql('Marasco');
      done();
    });
  });

  it('byUsername', (done) => {
    User.byUsername('david@maras.co', (err, result) => {
      result.firstName.should.eql('Antonio');
      result.lastName.should.eql('Marasco');
      done();
    });
  });

  it('delete', (done) => {
    User.all((err, users) => {
      User.delete(users[0]._id, () => {
        User.all((_, result) => {
          result.length.should.eql(1);
          result[0]._id.should.not.eql(users[0]._id);
          done();
        });
      });
    });
  });

  it('get', (done) => {
    User.all((err, result) => {
      User.get(result[0]._id, (_, data) => {
        data.firstName.should.eql('Antonio');
        data.lastName.should.eql('Marasco');
        done();
      });
    });
  });

  it('insert', (done) => {
    User.insert(
      {
        firstName: 'Erica',
        lastName: 'Marasco',
        email: 'erica@ericamarasco.com',
        email_lower: 'erica@ericamarasco.com',
        username: 'erica.marasco',
        username_lower: 'erica.marasco',
        status: 'active',
        password: 'Letme1n!',
        salt: '1NC7owXUlUj',
        roles: [
          {
            _id: '59af319cfc13ae21640000dc',
            name: 'Stylist',
            normalizedName: 'STYLIST'
          }
        ],
        refreshToken: {
          userId: '59e8e689ea1ea07ca6e6ef96',
          loginProvider: 'oAuth2',
          name: 'refresh_token3',
          scope: '*',
          type: 'bearer',
          expiresIn: 15552000,
          value: '123456789abcdefghi',
          protocol: 'http'
        }
      },
      (err, user) => {
        User.all((_, users) => {
          users.length.should.eql(3);
          users[2]._id.should.eql(user._id);
          users[2].firstName.should.eql('Erica');
          users[2].lastName.should.eql('Marasco');
          users[2].email.should.eql('erica@ericamarasco.com');
          users[2].username.should.eql('erica.marasco');

          done();
        });
      }
    );
  });

  it('insert::NoPassword', (done) => {
    User.insert(
      {
        firstName: 'Erica',
        lastName: 'Marasco',
        email: 'erica@ericamarasco.com',
        email_lower: 'erica@ericamarasco.com',
        username: 'erica.marasco',
        username_lower: 'erica.marasco',
        status: 'active',
        salt: '1NC7owXUlUj',
        roles: [
          {
            _id: '59af319cfc13ae21640000dc',
            name: 'Stylist',
            normalizedName: 'STYLIST'
          }
        ],
        refreshToken: {
          userId: '59e8e689ea1ea07ca6e6ef96',
          loginProvider: 'oAuth2',
          name: 'refresh_token3',
          scope: '*',
          type: 'bearer',
          expiresIn: 15552000,
          value: '123456789abcdefghi',
          protocol: 'http'
        }
      },
      (err, user) => {
        User.all((_, users) => {
          users.length.should.eql(3);
          users[2]._id.should.eql(user._id);
          users[2].firstName.should.eql('Erica');
          users[2].lastName.should.eql('Marasco');
          users[2].email.should.eql('erica@ericamarasco.com');
          users[2].username.should.eql('erica.marasco');

          done();
        });
      }
    );
  });

  it('passwordMatch : valid credentials', (done) => {
    User.passwordMatch('david@maras.co', 'Letme1n!', (err, data) => {
      data.firstName.should.eql('Antonio');
      data.lastName.should.eql('Marasco');
      done();
    });
  });

  it('passwordMatch : invalid credentials', (done) => {
    User.passwordMatch('david@maras.co', 'password', (err, data) => {
      expect(data).to.not.exist;
      done();
    });
  });

  it('passwordMatch : NULL password', (done) => {
    User.passwordMatch('david@maras.co', null, (err, data) => {
      expect(data).to.not.exist;
      expect(err).to.exist;
      done();
    });
  });

  it('summary', (done) => {
    User.summary(0, 2, (err, result) => {
      result.length.should.eql(2);
      expect(result[0].password).to.not.exist;
      expect(result[0].salt).to.not.exist;
      expect(result[0].refreshToken).to.not.exist;
      expect(result[0].loginAttempts).to.not.exist;
      expect(result[0].lockUntil).to.not.exist;
      done();
    });
  });

  it('update', (done) => {
    User.all((_, users) => {
      const body = {
        firstName: 'Paco'
      };
      User.update(users[0]._id, body, (error1, user) => {
        User.get(user._id, (error2, data) => {
          data.firstName.should.eql('Paco');
          done();
        });
      });
    });
  });

  it('updateToken', (done) => {
    User.all((err, result) => {
      const token = {
        userId: '59e8e689ea1ea07ca6e6ef96',
        loginProvider: 'oAuth2',
        name: 'refresh_token',
        scope: '*',
        type: 'bearer',
        expiresIn: 15552000,
        value: '123456789abcdefghi',
        protocol: 'http'
      };

      User.updateToken(result[0]._id, token, (_, user) => {
        user.refreshToken.value.should.eql('123456789abcdefghi');
        done();
      });
    });
  });

  describe('Force User Model Errors.', () => {
    describe('Faulty find and findOne method(s)', () => {
      const _find = UserModel.find;
      const _findById = UserModel.findById;
      const _findOne = UserModel.findOne;
      const _findByIdAndUpdate = UserModel.findByIdAndUpdate;
      const _findOneAndUpdate = UserModel.findOneAndUpdate;
      const _getAuthenticated = UserModel.getAuthenticated;

      beforeEach(() => {
        UserModel.find = () => Promise.reject('forced error');

        UserModel.findById = () => Promise.reject('forced error');

        UserModel.findOne = () => Promise.reject('forced error');

        UserModel.findByIdAndUpdate = () => Promise.reject('forced error');

        UserModel.findOneAndUpdate = () => Promise.reject('forced error');

        UserModel.getAuthenticated = () => Promise.reject('forced error');
      });

      afterEach(() => {
        UserModel.find = _find;
        UserModel.findById = _findById;
        UserModel.findOne = _findOne;
        UserModel.findByIdAndUpdate = _findByIdAndUpdate;
        UserModel.findOneAndUpdate = _findOneAndUpdate;
        UserModel.getAuthenticated = _getAuthenticated;
      });

      it('all should respond with *** [User].repository.all::find forced error', (done) => {
        User.all((error) => {
          expect(error).to.exist;
          done();
        });
      });

      it('allPaged should respond with *** [User].repository.allPaged(0, 2) forced error', (done) => {
        User.allPaged(0, 2, (error) => {
          expect(error).to.exist;
          done();
        });
      });

      it('byRefreshToken should respond with *** [User].repository.byRefreshToken::findOne forced error', (done) => {
        User.byRefreshToken(
          '77dd93db3f1455022d0a6f701c9bbd00e8b678f3',
          (error) => {
            expect(error).to.exist;
            done();
          }
        );
      });

      it('byRole should respond with *** [User].repository.byRole::find forced error', (done) => {
        User.byRole('Guest', (error) => {
          expect(error).to.exist;
          done();
        });
      });

      it('byUsername should respond with *** [User].repository.byUsername::find forced error', (done) => {
        User.byUsername('david@maras.co', (error) => {
          expect(error).to.exist;
          done();
        });
      });

      it('summary should respond with *** [User].repository.summary(0, 2) forced error', (done) => {
        User.summary(0, 2, (error) => {
          expect(error).to.exist;
          done();
        });
      });

      it('passwordMatch should respond with *** [User].repository.passwordMatch::findOne forced error', (done) => {
        User.passwordMatch('david@maras.co', 'password', (error) => {
          expect(error).to.exist;
          done();
        });
      });

      it('addDevice should respond with *** [User].repository.passwordMatch::findOne forced error', (done) => {
        const body = {
          pushRegistrationId: 'Registrion Id',
          cordova: 'body.cordova',
          model: 'body.model',
          platform: 'body.platform',
          uuid: 'body.uuid',
          version: 'body.version',
          manufacturer: 'body.manufacturer',
          isVirtual: 'body.isVirtual',
          serial: 'body.serial'
        };

        User.addDevice('123456789123', body, (error) => {
          expect(error).to.exist;
          done();
        });
      });

      it('update should respond with *** [User].repository.update(123456789123)::findById forced error', (done) => {
        User.update('123456789123', {}, (error) => {
          expect(error).to.exist;
          done();
        });
      });

      it('updateToken should respond with *** [User].repository.update(123456789123)::findById forced error', (done) => {
        User.updateToken('123456789123', 'asdfghjkl', (error) => {
          expect(error).to.exist;
          done();
        });
      });

      it('get should respond with *** [User].repository.get(123456789123) forced error', (done) => {
        User.get('123456789123', (error) => {
          expect(error).to.exist;
          done();
        });
      });
    });
  });

  describe('Faulty CRUD Methods', () => {
    describe('Faulty deleteOne, Insert method(s)', () => {
      const _deleteOne = UserModel.deleteOne;
      const _insert = UserModel.create;

      beforeEach(() => {
        UserModel.deleteOne = () => Promise.reject('forced error');

        UserModel.create = () => Promise.reject('forced error');
      });

      afterEach(() => {
        UserModel.deleteOne = _deleteOne;
        UserModel.save = _insert;
      });

      it('delete should respond with *** [User].repository.delete(1234)::remove forced error', (done) => {
        User.delete('1234', (error) => {
          expect(error).to.exist;
          done();
        });
      });

      it('insert should respond with *** [User].repository.insert()::save forced error', (done) => {
        const body = {
          firstName: 'Erica',
          lastName: 'Marasco',
          email: 'erica@ericamarasco.com',
          email_lower: 'erica@ericamarasco.com',
          username: 'erica.marasco',
          username_lower: 'erica.marasco',
          status: 'active',
          password: 'Letme1n!',
          salt: '1NC7owXUlUj',
          roles: [
            {
              _id: '59af319cfc13ae21640000dc',
              name: 'Stylist',
              normalizedName: 'STYLIST'
            }
          ],
          refreshToken: {
            userId: '59e8e689ea1ea07ca6e6ef96',
            loginProvider: 'oAuth2',
            name: 'refresh_token3',
            scope: '*',
            type: 'bearer',
            expiresIn: 15552000,
            value: '123456789abcdefghi',
            protocol: 'http'
          }
        };

        User.insert(body, (error) => {
          expect(error).to.exist;
          done();
        });
      });
    });
  });
});
