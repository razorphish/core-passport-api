'use strict';
/**
 * Wishlist Api
 */
const async = require('async');
const passport = require('passport');

const repo = require('../../../app/database/repositories/wishlist/wishlist-item.repository');
const utils = require('../../../lib/utils');
const logger = require('../../../lib/winston.logger');

/**
 * Wishlist Api Controller
 * http://.../api/wishlist/:id/item
 * @author Antonio Marasco
 */
class WishlistItemController {

  /**
   * Constructor for Wishlist
   * @param {router} router Node router framework
   * @example let controller = new WishlistController(router);
   */
  constructor(router) {
    router.get(
      '/:id/item',
      //passport.authenticate('user-bearer', { session: false }),
      //utils.isInRole('admin'),
      this.all.bind(this)
    );

    router.get(
      '/:id/item/page/:skip/:top',
      passport.authenticate('user-bearer', { session: false }),
      utils.isInRole('admin'),
      this.allPaged.bind(this)
    );

    router.get(
      '/:id/item/:itemId',
      passport.authenticate('user-bearer', { session: false }),
      utils.isInRole(['admin', 'user']),
      this.get.bind(this)
    );

    router.post(
      '/:id/item',
      passport.authenticate('user-bearer', { session: false }),
      //utils.isInRole('admin'),
      this.insert.bind(this)
    );

    router.put(
      '/:id/item/:itemId',
      passport.authenticate('user-bearer', { session: false }),
      utils.isInRole(['admin', 'user']),
      this.update.bind(this)
    );

    router.post(
      '/:id/item/:itemId/sort',
      passport.authenticate('user-bearer', { session: false }),
      //utils.isInRole(['admin', 'user']),
      this.sort.bind(this)
    );

    router.delete(
      '/:id/item/:itemId',
      passport.authenticate('user-bearer', { session: false }),
      utils.isInRole('admin'),
      this.delete.bind(this)
    );

    //Logging Info
    this._classInfo = '*** [wishlist-item].controller';
    this._routeName = '/api/wishlist/:id/item';

  }

  /**
   * Gets all Wishlist
   * @param {Request} [request] Request object
   * @param {Response} response Response
   * @example GET /api/wishlist/:id/item
   * @returns {pointer} res.json
   */
  all(request, response, next) {
    logger.info(`${this._classInfo}.all() [${this._routeName}]`);

    repo.all((error, result) => {
      if (error) {
        logger.error(`${this._classInfo}.all() [${this._routeName}]`, error);
        response.status(500).json(error);
        //next(error);
      } else {
        logger.debug(`${this._classInfo}.all() [${this._routeName}] OK`, result);
        response.json(result);
      }
    });
  }

  /**
   * Gets all Wishlist paginated
   * @param {Request} request Request object {Default:10}
   * @param {Request} [request.params.top=10]
   * @param {Response} response Response
   * @example /api/wishlist/page/2/10
   * @description /api/wishlist/:id/item/page/{page number}/{# per page}
   */
  allPaged(request, response) {
    logger.info(`${this._classInfo}.allPaged() [${this._routeName}]`);

    const topVal = request.params.top,
      skipVal = request.params.skip,
      top = isNaN(topVal) ? 10 : +topVal,
      skip = isNaN(skipVal) ? 0 : +skipVal;

    repo.allPaged(skip, top, (error, result) => {
      //response.setHeader('X-InlineCount', result.count);
      if (error) {
        logger.error(`${this._classInfo}.allPaged() [${this._routeName}]`, error);
        response.status(500).json(error);
      } else {
        logger.debug(`${this._classInfo}.allPaged() [${this._routeName}] OK`, result);
        response.json(result);
      }
    });
  }

  /**
   * Deletes a wishlist
   * @param {Request} request Request object
   * @param {Response} response Response object
   * @example DELETE /api/wishlist/:id/item/:itemId
   * @returns {status: true|false} via res pointer
   */
  delete(request, response) {
    const id = request.params.id;
    logger.info(`${this._classInfo}.delete(${id}) [${this._routeName}]`);

    repo.delete(id, (error, result) => {
      if (error) {
        logger.error(`${this._classInfo}.delete() [${this._routeName}]`, error);
        response.status(500).json(error);
      } else {
        logger.debug(`${this._classInfo}.delete() [${this._routeName}] OK`, result);
        response.json(result);
      }
    });
  }

  /**
   * Gets a Wishlist by its id
   * @param {Request} request Request object
   * @param {Response} response Response
   * @example GET /api/wishlist/:id/item/:itemId
   */
  get(request, response) {
    const id = request.params.id;
    logger.info(`${this._classInfo}.get(${id}) [${this._routeName}]`);

    repo.get(id, (error, result) => {
      if (error) {
        logger.error(`${this._classInfo}.get() [${this._routeName}]`, error);
        response.status(500).send(error)
      } else {
        logger.debug(`${this._classInfo}.get() [${this._routeName}] OK`, result);
        response.json(result);
      }
    });
  }

  /**
   * Inserts a wishlist
   * @param {Request} request Request object
   * @param {Response} response Response
   * @example POST /api/wishlist/:id/item
   */
  insert(request, response, next) {
    logger.info(`${this._classInfo}.insert() [${this._routeName}]`);

    async.waterfall([
      (done) => {
        repo.all((error, data) => {
          let itemCount = 0;
          if (error) {
            logger.error(`${this._classInfo}.insert() [${this._routeName}]`, error);
            response.status(500).send(error);
          } else {
            if (data) {
              itemCount = data.length;
            }

            done(null, itemCount)
          }
        })
      },
      (itemCount, done) => {
        request.body.sortOrder = itemCount;

        repo.insert(request.body, (error, result) => {
          if (error) {
            logger.error(`${this._classInfo}.insert() [${this._routeName}]`, error);
            response.status(500).send(error);
          } else {
            logger.debug(`${this._classInfo}.insert() [${this._routeName}] OK`, result);
            return done(null, result)
          }
        });
      }
    ], (error, result) => {
      if (error) {
        logger.error(`${this._classInfo}.insert() [${this._routeName}]`, error);
        return next(error)
      }
      logger.debug(`${this._classInfo}.insert() [${this._routeName}] OK`);
      response.json(result);
    })
  }

  /**
 * Updates a wishlist
 * @param {Request} request Request object
 * @param {Response} response Response object
 * @example PUT /api/wishlist/:id/item/:itemId
 */
  update(request, response) {
    const id = request.params.id; //wishlist id
    const itemId = request.params.itemId; //wishlist item id

    logger.info(`${this._classInfo}.update(${id}) [${this._routeName}]`);

    repo.update(id, request.body, (error, result) => {
      if (error) {
        logger.error(`${this._classInfo}.update() [${this._routeName}]`, error, request.body);
        response.status(500).send(error);
      } else {
        logger.debug(`${this._classInfo}.update() [${this._routeName}] OK`, result);
        response.json(result);
      }
    });
  }

  /**
   * Sorts a wishlist
   * @param {Request} request Request object
   * @param {Response} response Response object
   * @example PUT /api/wishlist/:id/item/:itemId
   */
  sort(request, response, next) {
    const wishlistId = request.params.id; //wishlist id
    const itemId = request.params.itemId; //wishlist item id

    logger.info(`${this._classInfo}.sort(${wishlistId}) [${this._routeName}]`);

    async.waterfall([
      (done) => {
        repo.byWishlistId(wishlistId, (error, result) => {
          if (error) {
            logger.error(`${this._classInfo}.sort() [${this._routeName}]`, error);
            response.status(500).send(error);
          } else {
            done(null, result);
          }
        })
      },
      (wishlistItems, done) => {
        const rangeIndex = request.body.oldIndex - request.body.newIndex;
        const oldIndex = request.body.oldIndex;
        const newIndex = request.body.newIndex;
        const sortIncrementUp = rangeIndex > -1

        wishlistItems.forEach((wishlistItem) => {
          let sortOrder = wishlistItem.sortOrder;

          if (wishlistItem.sortOrder === oldIndex) {
            wishlistItem.sortOrder = newIndex;
          } else {
            if (sortIncrementUp) {
              if (sortOrder >= newIndex && sortOrder < oldIndex) {
                wishlistItem.sortOrder = sortOrder + 1;
              }
            } else {
              if (sortOrder > oldIndex && sortOrder <= newIndex) {
                wishlistItem.sortOrder = sortOrder - 1;
              }
            }
          }
        })

        return done(null, wishlistItems);
      },
      (sortedWishlistItems, done) => {

        repo.sort(sortedWishlistItems, (error, data) => {
          if (error) {
            logger.error(`${this._classInfo}.sort() [${this._routeName}]`, error);
            response.status(500).send(error);
          } else {
            done(null, sortedWishlistItems);
          }
        })
      },
      (updatedWishlistItems, done) => {
        updatedWishlistItems.sort((a,b) => (a.sortOrder > b.sortOrder) ? 1 : ((b.sortOrder > a.sortOrder) ? -1 : 0));
        done(null, updatedWishlistItems);
      }
    ], (error, result) => {
      if (error) {
        logger.error(`${this._classInfo}.insert() [${this._routeName}]`, error);
        return next(error)
      }
      logger.debug(`${this._classInfo}.insert() [${this._routeName}] OK`);
      response.json(result);
    })

  }
}

module.exports = WishlistItemController;
