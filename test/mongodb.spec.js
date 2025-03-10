/* eslint-disable no-undef */
// NPM install mongoose and chai. Make sure mocha is globally
// installed
process.env.NODE_ENV = 'test';
const mongoose = require('mongoose');

const { Schema } = mongoose;

// Create a new schema that accepts a 'name' object.
// 'name' is a required field
const testSchema = new Schema({
  name: { type: String, required: true }
});
// Create a new collection called 'Name'
const Name = mongoose.model('Name', testSchema);
describe('Database Tests', () => {
  // Before starting the test, create a sandboxed database connection
  // Once a connection is established invoke done()
  before((done) => {
    mongoose.connect('mongodb://127.0.0.1/mydb_test', {
      useNewUrlParser: true
    });
    const db = mongoose.connection;
    db.on('error', console.error.bind(console, 'connection error'));
    db.once('open', () => {
      console.log('We are connected to test database!');
      done();
    });
  });
  describe('Test Database', () => {
    // Save object with 'name' value of 'Mike"
    it('New name saved to test database', (done) => {
      const testName = Name({
        name: 'Mike'
      });

      testName.save(done);
    });
    it('Dont save incorrect format to database', (done) => {
      // Attempt to save with wrong info. An error should trigger
      const wrongSave = Name({
        notName: 'Not Mike'
      });
      wrongSave.save((err) => {
        if (err) {
          return done();
        }
        throw new Error('Should generate error!');
      });
    });
    it('Should retrieve data from test database', (done) => {
      // Look up the 'Mike' object previously saved.
      Name.find({ name: 'Mike' }, (err, name) => {
        if (err) {
          throw err;
        }
        if (name.length === 0) {
          throw new Error('No data!');
        }
        done();
      });
    });
  });
  // After all tests are finished drop database and close connection
  after((done) => {
    mongoose.connection.db.dropDatabase(() => {
      mongoose.connection.close(done);
    });
  });
});
