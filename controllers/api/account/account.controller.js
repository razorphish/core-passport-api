// Account Api
const passport = require('passport');
const repo = require('../../../app/database/repositories/account/account.repository');
const utils = require('../../../lib/utils');
const logger = require('../../../lib/winston.logger');

/**
 * account Api Controller
 * http://.../api/account
 * @author Antonio Marasco
 */
class AccountController {
  /**
   * Constructor for accounts
   * @param {router} router Node router framework
   */
  constructor(router) {
    router.get(
      '/',
      passport.authenticate('user-bearer', { session: false }),
      utils.isInRole('admin'),
      this.all.bind(this)
    );
    router.get(
      '/page/:skip/:top',
      passport.authenticate('user-bearer', { session: false }),
      utils.isInRole('admin'),
      this.allPaged.bind(this)
    );
    router.get(
      '/:id',
      passport.authenticate('user-bearer', { session: false }),
      utils.isInRole('admin'),
      this.get.bind(this)
    );
    router.post(
      '/',
      passport.authenticate('user-bearer', { session: false }),
      utils.isInRole('admin'),
      this.insert.bind(this)
    );

    router.put(
      '/:id',
      passport.authenticate('user-bearer', { session: false }),
      utils.isInRole('admin'),
      this.update.bind(this)
    );
    router.delete(
      '/:id',
      passport.authenticate('user-bearer', { session: false }),
      utils.isInRole('admin'),
      this.delete.bind(this)
    );

    // Logging Info
    this._classInfo = '*** [account].controller';
    this._routeName = '/api/account';
  }

  /**
   * Gets all accounts
   * @param {Request} [request] Request object
   * @param {Response} response Response
   * @example GET /api/account
   * @returns {pointer} res.json
   */
  all(request, response) {
    logger.info(`${this._classInfo}.all() [${this._routeName}]`);

    repo.all((error, result) => {
      if (error) {
        logger.error(`${this._classInfo}.all() [${this._routeName}]`, error);
        response.status(500).send(error);
        // next(error);
      } else {
        logger.debug(`${this._classInfo}.all() [${this._routeName}] OK`);
        response.json(result);
      }
    });
  }

  /**
   * Gets all accounts paginated
   * @param {Request} request Request object {Default:10}
   * @param {Request} [request.params.top=10]
   * @param {Response} response Response
   * @example /api/account/page/2/10
   * @description /api/account/page/{page number}/{# per page}
   */
  allPaged(request, response) {
    logger.info(`${this._classInfo}.allPaged() [${this._routeName}]`);

    const topVal = request.params.top;
    const skipVal = request.params.skip;
    const top = Number.isNan(topVal) ? 10 : +topVal;
    const skip = Number.isNan(skipVal) ? 0 : +skipVal;

    repo.allPaged(skip, top, (error, result) => {
      // response.setHeader('X-InlineCount', result.count);
      if (error) {
        logger.error(
          `${this._classInfo}.allPaged() [${this._routeName}]`,
          error
        );
        response.status(500).send(error);
      } else {
        logger.debug(`${this._classInfo}.allPaged() [${this._routeName}] OK`);
        response.json(result);
      }
    });
  }

  /**
   * Deletes a account
   * @param {Request} request Request object
   * @param {Response} response Response object
   * @example DELETE /api/account/:id
   * @returns {status: true|false} via res pointer
   */
  delete(request, response) {
    const { id } = request.params;
    logger.info(`${this._classInfo}.delete(${id}) [${this._routeName}]`);

    repo.delete(id, (error, result) => {
      if (error) {
        logger.error(`${this._classInfo}.delete() [${this._routeName}]`, error);
        response.status(500).send(error);
      } else {
        logger.debug(`${this._classInfo}.delete() [${this._routeName}] OK`);
        response.json(result);
      }
    });
  }

  /**
   * Gets a account by its id
   * @param {Request} request Request object
   * @param {Response} response Response
   * @example GET /api/account/:id
   */
  get(request, response) {
    const { id } = request.params;
    logger.info(`${this._classInfo}.get(${id}) [${this._routeName}]`);

    repo.get(id, (error, result) => {
      if (error) {
        logger.error(`${this._classInfo}.get() [${this._routeName}]`, error);
        response.status(500).send(error);
      } else {
        logger.debug(`${this._classInfo}.get() [${this._routeName}] OK`);
        response.json(result);
      }
    });
  }

  /**
   * Inserts a account
   * @param {Request} request Request object
   * @param {Response} response Response
   * @example POST /api/account
   */
  insert(request, response) {
    logger.info(`${this._classInfo}.insert() [${this._routeName}]`);

    repo.insert(request.body, (error, result) => {
      if (error) {
        logger.error(`${this._classInfo}.insert() [${this._routeName}]`, error);
        response.status(500).send(error);
      } else {
        logger.debug(`${this._classInfo}.insert() [${this._routeName}] OK`);
        response.json(result);
      }
    });
  }

  /**
   * Updates a account
   * @param {Request} request Request object
   * @param {Response} response Response object
   * @examle PUT /api/user/:id
   */
  update(request, response) {
    const { id } = request.params;
    logger.info(`${this._classInfo}.update(${id}) [${this._routeName}]`);

    repo.update(id, request.body, (error, result) => {
      if (error) {
        logger.error(
          `${this._classInfo}.update() [${this._routeName}]`,
          error,
          request.body
        );
        response.status(500).send(error);
      } else {
        logger.debug(`${this._classInfo}.update() [${this._routeName}] OK`);
        response.json(result);
      }
    });
  }
}

module.exports = AccountController;
