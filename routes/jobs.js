"use strict";

/** Routes for jobs. */

const express = require("express");
const { BadRequestError, ExpressError } = require("../expressError");
const { ensureAdmin } = require("../middleware/auth");
const Job = require("../models/job");

const jsonschema = require("jsonschema")
const jobUpdateSchema = requrie("../schemas/jobUpdate.json")
const jobSearchSchema = require("../schemas/jobSearch.json")
const jobNewSchema = require("../schemas/jobNew.json")
const router = express.Router();

/** GET / =>
 *   { jobs: [ { id, title, salary, equity, companyHandle, companyName }, ...] }
 *
 * Can provide search filter in query:
 * - minSalary
 * - hasEquity (true returns only jobs with equity > 0, other values ignored)
 * - title (will find case-insensitive, partial matches)

 * Authorization required: none
 */

router.get("/", async function (req, res, next) {
    const q = req.query;
    // arrive as strings from querystring, but we want as int/bool
    if (q.minSalary !== undefined) q.minSalary = +q.minSalary;
    q.hasEquity = q.hasEquity === "true";

    // check to make sure q has correct values for querying
    const validQCheck = jsonschema.validate(q, jobSearchSchema);
    if (!validQCheck.valid) {
        let listOfErrors = validQCheck.errors.map(error => error.stack);
        let error = new ExpressError(listOfErrors, 400);
        return next(err)
    }
    // call
    try {
      const jobs = await Job.findAll(q);
      return res.json({ jobs });
    } catch (err) {
      return next(err);
    }
  });

  router.patch("/:id", async function (req, res, next) {
    const q = req.query;
    // arrive as strings from querystring, but we want as int/bool
    if (q.minSalary !== undefined) q.minSalary = +q.minSalary;
    q.hasEquity = q.hasEquity === "true";

    // check to make sure q has correct values for querying
    const validQCheck = jsonschema.validate(q, jobUpdateSchema);
    if (!validQCheck.valid) {
        let listOfErrors = validQCheck.errors.map(error => error.stack);
        let err = new ExpressError(listOfErrors, 400);
        return next(err)
    }
    // call
    try {
      const jobs = await Job.update(q);
      return res.json({ jobs });
    } catch (err) {
      return next(err);
    }
  });


module.exports = router;
