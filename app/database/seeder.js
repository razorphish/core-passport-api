// Module dependencies
const mongoose = require('mongoose'),
    Customer = require('./models/customer.model'),
    BookSeeder = require('./seeders/book.seeder'),
    logger = require('../../lib/winston.logger');

(dbConfig = require('../../lib/config.loader').databaseConfig),
    (connectionString = `mongodb://${dbConfig.host}/${dbConfig.database}`),
    (connection = null);

class DBSeeder {
    init() {
        mongoose.connection.db
            .listCollections({
                name: 'customers'
            })
            .next((err, collinfo) => {
                if (!collinfo) {
                    logger.info('Starting dbSeeder...');
                    this.seed();
                }
            });
    }

    seed() {
        logger.info('Seeding data....');

        //Customers
        var customerNames = [
            'Marcus,HighTower,Male,acmecorp.com'
        ];
        var addresses = [
            '1234 Anywhere St.'
        ];

        var citiesStates = [
            'Phoenix,AZ,Arizona'
        ];

        var citiesIds = [
            5
        ];

        var zip = 85229;

        var orders = [
            {
                product: 'Basket',
                price: 29.99,
                quantity: 1
            }
        ];

        Customer.remove({});

        var l = customerNames.length,
            i,
            j,
            firstOrder,
            lastOrder,
            tempOrder,
            n = orders.length;

        for (i = 0; i < l; i++) {
            var nameGenderHost = customerNames[i].split(',');
            var cityState = citiesStates[i].split(',');
            var state = {
                id: citiesIds[i],
                abbreviation: cityState[1],
                name: cityState[2]
            };
            var customer = new Customer({
                firstName: nameGenderHost[0],
                lastName: nameGenderHost[1],
                email:
                    nameGenderHost[0] + '.' + nameGenderHost[1] + '@' + nameGenderHost[3],
                address: addresses[i],
                city: cityState[0],
                state: state,
                stateId: citiesIds[i],
                zip: zip + i,
                gender: nameGenderHost[2],
                orderCount: 0
            });
            firstOrder = Math.floor(Math.random() * orders.length);
            lastOrder = Math.floor(Math.random() * orders.length);
            if (firstOrder > lastOrder) {
                tempOrder = firstOrder;
                firstOrder = lastOrder;
                lastOrder = tempOrder;
            }

            customer.orders = [];

            logger.debug('firstOrder: ' + firstOrder + ', lastOrder: ' + lastOrder);

            for (j = firstOrder; j <= lastOrder && j < n; j++) {
                var today = new Date();
                var tomorrow = new Date();
                tomorrow.setDate(today.getDate() + Math.random() * 100);

                var o = {
                    product: orders[j].product,
                    price: orders[j].price,
                    quantity: orders[j].quantity,
                    date: tomorrow
                };
                customer.orders.push(o);
            }
            customer.orderCount = customer.orders.length;

            customer.save((err, cust) => {
                if (err) {
                    logger.error('Error occurred saving customer', err);
                } else {
                    logger.debug(`inserted customer: ${cust.firstName} ${cust.lastName}`);
                }
            });
        }

        // Book
        //BookSeeder.seed();


    }
}

module.exports = new DBSeeder();