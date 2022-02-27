/*
 *
 *
 *       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
 *       -----[Keep the tests in the same order!]-----
 *
 */

const chaiHttp = require("chai-http");
const chai = require("chai");
const assert = chai.assert;
const expect = chai.expect;
const { before, after } = require("mocha");
const server = require("../server");

chai.use(chaiHttp);

suite("Functional Tests", function () {
   /*
    * ----[EXAMPLE TEST]----
    * Each test should completely test the response of the API end-point including response status code!
    */
   test("#example Test GET /api/books", function (done) {
      chai
         .request(server)
         .get("/api/books")
         .end(function (err, res) {
            assert.equal(res.status, 200);
            assert.isArray(res.body, "response should be an array");
            assert.property(
               res.body[0],
               "commentcount",
               "Books in array should contain commentcount"
            );
            assert.property(res.body[0], "title", "Books in array should contain title");
            assert.property(res.body[0], "_id", "Books in array should contain _id");
            done();
         });
   });
   /*
    * ----[END of EXAMPLE TEST]----
    */

   suite("Routing tests", function () {
      let id;
      suite(
         "POST /api/books with title => create book object/expect book object",
         function () {
            test("Test POST /api/books with title", function (done) {
               chai
                  .request(server)
                  .post("/api/books")
                  .send({ title: "Test book" })
                  .end(function (err, res) {
                     expect(err).to.be.null;
                     expect(res).to.have.status(200);
                     assert.isObject(res.body);
                     assert.propertyVal(
                        res.body,
                        "title",
                        "Test book",
                        "should have the correct title"
                     );
                     assert.isString(res.body.title, "title should be a string");
                     id = res.body._id;
                     done();
                  });
            });

            test("Test POST /api/books with no title given", function (done) {
               chai
                  .request(server)
                  .post("/api/books")
                  .end(function (err, res) {
                     expect(err).to.be.null;
                     expect(res).to.have.status(200);
                     assert.isString(res.text);
                     assert.equal(res.text, "missing required field title");
                     done();
                  });
            });

            after(function (done) {
               chai
                  .request(server)
                  .delete(`/api/books/${id}`)
                  .end((err, res) => {
                     done();
                  });
            });
         }
      );

      suite("GET /api/books => array of books", function () {
         test("Test GET /api/books", function (done) {
            chai
               .request(server)
               .get("/api/books")
               .end(function (err, res) {
                  expect(err).to.be.null;
                  expect(res).to.have.status(200);
                  assert.isArray(res.body, "response should be an array");
                  assert.property(
                     res.body[0],
                     "comments",
                     "items have property named 'comments'"
                  );
                  assert.property(res.body[0], "_id", "items have _id property");
                  assert.property(res.body[0], "title", "items have title property");
                  assert.isString(res.body[0].title, "title property is string");
                  done();
               });
         });
      });

      suite("GET /api/books/[id] => book object with [id]", function () {
         let id;

         before("Create DB entry for testing", function (done) {
            chai
               .request(server)
               .post("/api/books")
               .send({ title: "TEST BOOK" })
               .end(function (err, res) {
                  id = res.body._id;
                  done();
               });
         });

         test("Test GET /api/books/[id] with id not in db", function (done) {
            chai
               .request(server)
               .get(`/api/books/idnotindb`)
               .end(function (err, res) {
                  expect(err).to.be.null;
                  expect(res).to.have.status(200);
                  assert.equal(res.text, "no book exists");
                  assert.isEmpty(res.body, "response body should be empty");
                  done();
               });
         });

         test("Test GET /api/books/[id] with valid id in db", function (done) {
            chai
               .request(server)
               .get(`/api/books/${id}`)
               .end(function (err, res) {
                  expect(err).to.be.null;
                  expect(res).to.have.status(200);
                  assert.isObject(res.body, "body should be an object");
                  assert.property(res.body, "_id", "body should have an _id property");
                  assert.equal(res.body._id, id, `returned _id should match ${id}`);
                  assert.property(res.body, "title", "body should have title property");
                  done();
               });
         });

         after("delete DB entry after tests", function (done) {
            chai
               .request(server)
               .delete(`/api/books/${id}`)
               .end(function () {
                  done();
               });
         });
      });

      suite("POST /api/books/[id] => add comment/expect book object with id", function () {
         let id;

         before("Creat DB entry before testing", function (done) {
            chai
               .request(server)
               .post("/api/books")
               .send({ title: "TEST BOOK" })
               .end(function (err, res) {
                  id = res.body._id;
                  done();
               });
         });

         test("Test POST /api/books/[id] with comment", function (done) {
            chai
               .request(server)
               .post(`/api/books/${id}`)
               .send({ comment: "Test comment" })
               .end(function (err, res) {
                  expect(err).to.be.null;
                  expect(res).to.have.status(200);
                  assert.property(res.body, "_id", "body should have _id property");
                  assert.property(
                     res.body,
                     "comments",
                     "body should have comments porperty"
                  );
                  assert.isArray(res.body.comments, "comments property is an array");
                  assert.property(
                     res.body,
                     "commentcount",
                     "body should have commentcount property"
                  );
                  assert.isAtLeast(
                     res.body.commentcount,
                     1,
                     "comment count should be at least one"
                  );
                  assert.oneOf(
                     "Test comment",
                     res.body.comments,
                     "Test comment should be in comment array"
                  );
                  done();
               });
         });

         test("Test POST /api/books/[id] without comment field", function (done) {
            chai
               .request(server)
               .post(`/api/books/${id}`)
               .end(function (err, res) {
                  expect(err).to.be.null;
                  expect(res).to.have.status(200);
                  assert.isEmpty(res.body, "response body should be empty");
                  assert.equal(res.text, "missing required field comment");
                  assert.notExists(res.body.title, "title property should not exist");
                  done();
               });
         });

         test("Test POST /api/books/[id] with comment, id not in db", function (done) {
            chai
               .request(server)
               .post("/api/books/invalidid")
               .send({ comment: "Test comment" })
               .end(function (err, res) {
                  expect(err).to.be.null;
                  expect(res).to.have.status(200);
                  assert.equal(res.text, "no book exists");
                  assert.isEmpty(res.body, "response body should be empty");
                  done();
               });
         });

         after("delete DB entry after tests", function (done) {
            chai
               .request(server)
               .delete(`/api/books/${id}`)
               .end(function () {
                  done();
               });
         });
      });

      suite("DELETE /api/books/[id] => delete book object id", function () {
         let id;

         before("Create DB entry for testing", function (done) {
            chai
               .request(server)
               .post("/api/books")
               .send({ title: "BOOK TO BE DELETED" })
               .end(function (err, res) {
                  id = res.body._id;
                  done();
               });
         });

         test("Test DELETE /api/books/[id] with valid id in db", function (done) {
            chai
               .request(server)
               .delete(`/api/books/${id}`)
               .end(function (err, res) {
                  expect(err).to.be.null;
                  expect(res).to.have.status(200);
                  assert.isEmpty(res.body, "response body should be empty");
                  assert.equal(res.text, "delete successful");
                  done();
               });
         });

         test("Test DELETE /api/books/[id] with  id not in db", function (done) {
            chai
               .request(server)
               .delete("/api/books/invalidid")
               .end(function (err, res) {
                  expect(err).to.be.null;
                  expect(res).to.have.status(200);
                  assert.isEmpty(res.body, "response body should be empty");
                  assert.equal(res.text, "no book exists");
                  done();
               });
         });
      });
   });
});
