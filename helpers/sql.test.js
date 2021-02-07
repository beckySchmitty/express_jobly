"use strict";

const db = require("../db.js");
const { BadRequestError, NotFoundError } = require("../expressError");
const Company = require("./company.js");
const sqlForPartialUpdate = require("./sql.js")
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

// *************************************************** 

describe("Input variables to output varibles works", function () {
    test("dataToUpdate sucessfully returns correct values", function () {

    });

    test("jsToSql sucessfully returns correct setCols", function () {

    });


});

// describe - errors thrown when needed
// test - dataToUpdate empty throws error
// test - test incorrect col name w/ query to company??