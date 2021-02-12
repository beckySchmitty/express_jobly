"use strict";

const db = require("../db.js");
const { BadRequestError, NotFoundError } = require("../expressError");
const Job = require("./job.js");
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

/************************************** create */

describe("[MODEL] create Job", function () {
  const newJob = {
    title: "new",
    salary: 77000,
    equity: 0,
    company_handle: 'c1',
  };

  test("created", async function () {
    let job = await Job.create(newJob);
    expect(job).toEqual(newJob);

    test("works", async function () {
        let job = await Job.create(newJob);
        expect(job).toEqual({
          ...newJob,
          id: expect.any(Number),
        });
  });

});

/************************************** findAll */

describe("Job.findAll()", function () {
  test("works: no filter", async function () {
    let jobs = await Job.findAll();
    expect(jobs).toEqual([
        {
            title: "fake j1",
            salary: 99000,  
            equity: 0,
            company_handle: "c1" 
            },
        {
            title: "fake j2",
            salary: 99000,  
            equity: 0,
            company_handle: "c2" 
            },
        {
            title: "fake j3",
            salary: 99000,  
            equity: 0,
            company_handle: "c3" 
            }
    ]);
  });
});

/************************************** get */

describe("Job.get(id)", function () {
  test("works", async function () {
    let job = await Job.get(1);
    expect(job).toEqual({
        title: "fake j1",
        salary: 99000,  
        equity: 0,
        company_handle: "c1" 
        });
  });

  test("not found if no such job", async function () {
    try {
      await Job.get("nope");
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});

/************************************** update */

describe("update", function () {
  const updateData = {
    title: "new",
    salary: 50000,
    equity: 5,
  };

  test("works", async function () {
    let job = await Job.update("1", updateData);
    expect(job).toEqual({
        id: 1,
        title: "new",
        salary: 50000,  
        equity: 5,
        company_handle: "c1" 
        });
  });

  test("not found if no such job", async function () {
    try {
      await Job.update("nope", updateData);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });

  test("bad request with no data", async function () {
    try {
      await JOb.update("c1", {});
      fail();
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });
});

/************************************** remove */

describe("remove", function () {
  test("works", async function () {
    await Job.remove(2);
    const res = await db.query(
        "SELECT id FROM jobs WHERE id = 2");
    expect(res.rows.length).toEqual(0);
  });

  test("not found if no such company", async function () {
    try {
      await Job.remove("nope");
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});
