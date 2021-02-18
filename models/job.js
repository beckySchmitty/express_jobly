"use strict";

const db = require("../db");
const {NotFoundError } = require("../expressError");
const { sqlForPartialUpdate } = require("../helpers/sql");

/** Related functions for jobs. */

class Job {
  /** Create a Job (from data), update db, return new company data.
   *
   * data should be { title, salary, equity, company_handle }
   * NOTE: company_handle references companies table
   *
   * Returns { title, salary, equity, company_handle }
   *
   * Throws BadRequestError if company already in database.
   * */

  static async create(data) {

    const result = await db.query(
          `INSERT INTO jobs
           (title, salary, equity, company_handle)
           VALUES ($1, $2, $3, $4)
           RETURNING id, title, salary, equity, company_handle AS "companyHandle"`,
        [
            data.title, 
            data.salary, 
            data.equity, 
            data.companyHandle
        ],
    );
    const job = result.rows[0];

    return job;
  }

//   Find all jobs (optional filters passed in through queryObj)
// filter's include:
// title (will find case-insensitive, partial matches)
// minSalary
// hasEquity 

// Returns [{ id, title, salary, equity, companyHandle, companyName }, ...]

  static async findAll({title, minSalary, hasEquity} = {}) {

    // base query to be called
    let query = `SELECT j.id,
                        j.title,
                        j.salary,
                        j.equity,
                        j.company_handle AS "companyHandle",
                        c.name AS "companyName"
                 FROM jobs j 
                   LEFT JOIN companies AS c ON c.handle = j.company_handle`;
    let whereExpressions = [];
    let queryVals = [];

    // For each possible search term, add to whereExpressions and
    // queryValues so we can generate the right SQL

    // let {title, minSalary, hasEquity} = queryObj;

    if (title !== undefined) {
        queryVals.push(`%${title}%`);
        whereExpressions.push(`title ILIKE $${queryVals.length}`);
    }

    if (minSalary !== undefined) {
        queryVals.push(minSalary);
        whereExpressions.push(`salary >= $${queryVals.length}`);
    }

    if (hasEquity) {
        whereExpressions.push(`equity > 0`);
    }

    if (whereExpressions.length > 0) {
        query += " WHERE " + whereExpressions.join(" AND ");
      }
  
      // Finalize query and return results
      query += " ORDER BY title";
      const jobs = await db.query(query, queryVals);
      return jobs.rows;
  }
  

  /** Given a job id, return data about job.
   *
   * Returns { id, title, salary, equity, companyHandle, company }
   *   where company is { handle, name, description, numEmployees, logoUrl }
   *
   * Throws NotFoundError if not found.
   **/

  static async get(id) {
    const jobResp = await db.query(
        `SELECT id,
                title,
                salary,
                equity,
                company_handle AS "companyHandle"
         FROM jobs
         WHERE id = $1`, [id]);

  const job = jobResp.rows[0];

  if (!job) {
  throw new NotFoundError(`No job with id of ${id}`);
  }
  const companiesResp = await db.query(
        `SELECT handle,
                name,
                description,
                num_employees AS "numEmployees",
                logo_url AS "logoUrl"
         FROM companies
         WHERE handle = $1`, [job.companyHandle]);

  delete job.companyHandle;
  job.company = companiesResp.rows[0];

  return job;

  }

  /** Update job data with `data`.
   *
   * This is a "partial update" --- it's fine if data doesn't contain
   * all the fields; this only changes provided ones.
   *
   * Data can include: { title, salary, equity }
   *
   * Returns { id, title, salary, equity, companyHandle }
   *
   * Throws NotFoundError if not found.
   */

  static async update(id, data) {
    const { setCols, values } = sqlForPartialUpdate(data, {});
    const idIdx = "$" + (values.length + 1)

    const querySQL =`UPDATE jobs
    SET ${setCols}
    WHERE id = ${idIdx}
    RETURNING id, 
    title, 
    salary, 
    equity,
    company_handle AS "companyHandle"`;

    const result = await db.query(querySQL, [...values, id])
    const job = result.rows[0];

    if (!job) throw new NotFoundError(`No job to update with id of ${id}`)

    return job;
  }


  /** Delete given job from database; returns undefined.
   *
   * Throws NotFoundError if company not found.
   **/

 static async remove(id) {
      const result = await db.query(`DELETE FROM jobs
      WHERE id = $1 
      RETURNING id`, [id]);

      if(!result.rows[0]) throw new NotFoundError(`No job to delete with id of ${id}`)

      return undefined;
    }

}


module.exports = Job;