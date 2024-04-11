// ********************** Initialize server **********************************

const server = require('../index');

// ********************** Import Libraries ***********************************

const chai = require('chai'); // Chai HTTP provides an interface for live integration testing of the API's.
const chaiHttp = require('chai-http');
chai.should();
chai.use(chaiHttp);
const {assert, expect} = chai;

// ********************** DEFAULT WELCOME TESTCASE ****************************

describe('Server!', () => {
  // Sample test case given to test / endpoint.
  it('Returns the default welcome message', done => {
    chai
      .request(server)
      .get('/welcome')
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body.status).to.equals('success');
        assert.strictEqual(res.body.message, 'Welcome!');
        done();
      });
  });
});

// *********************** TODO: WRITE 2 UNIT TESTCASES **************************
// Example Positive Testcase :
// API: /register
// Input: {username: 'JohnnyDoe', password: '197254Th_'}
// Expect: redirects to '/login' and res.body.message == 'Success'
// Result: This test case should pass and redirect the user to the login page
// Explanation: The testcase will call the /register API with the following input
describe('Testing Add User API', () => {
  it('positive : /register', done => {
    chai
      .request(server)
      .post('/register')
      .send({username: 'JohnnyDoe', password: '197254Th_'})
      .end((err, res) => {
        //expect(res).to.have.status(200);
        //expect(res.body.message).to.equals('Success');
        expect(res).to.redirect; // Expecting a redirect response
        expect(res.redirects[0]).to.include('/login'); // Expecting the redirect URL to contain '/login'
        done();
      });
  });
});
// Example Negative Testcase :
// API: /register
// Input: {username: 'JohnnyDoe', password: 'password'}
// Expect: res.status == 400
// Result: This test case should fail and return a status 400
// Explanation: The testcase will attempt to register with a username that is already in the users database and be unable to.
describe('Testing Add User API', () => {
  it('negative : /register', done => {
    chai
      .request(server)
      .post('/register')
      .send({username: 'JohnnyDoe', password: 'password'})
      .end((err, res) => {
        expect(res).to.have.status(400);
        expect(res.body.status).to.equals('error');
        done();
      });
  });
});
// ********************************************************************************
// ***************** TODO: 2 MORE UNIT TEST CASES USING OTHER ENDPOINT ******************
// Example Positive Testcase :
// API: /login
// Expect: redirects to '/login' and status == 200
// Result: This test case should pass and redirect the user to the login page
describe('Testing Render', () => {
  // Sample test case given to test /test endpoint.
  it('test "/login" route should render with an html response', done => {
    chai
      .request(server)
      .get('/login') // for reference, see lab 8's login route (/login) which renders home.hbs
      .end((err, res) => {
        res.should.have.status(200); // Expecting a success status code
        res.should.be.html; // Expecting a HTML response
        done();
      });
  });
});
// Example Negative Testcase :
// API: /log
// Expect: attempts to redirect to non-existent '/log' endpoint and status == 400
// Result: This test case should pass and redirect the user to the login page
describe('Testing Render', () => {
  // Sample test case given to test /test endpoint.
  it('test "/log" route', done => {
    chai
      .request(server)
      .get('/log')
      .end((err, res) => {
        expect(res).to.have.status(400);
        expect(res.body.status).to.equals('error');
        done();
      });
  });
});