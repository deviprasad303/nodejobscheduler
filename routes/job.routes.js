module.exports = app => {
  const jobs = require("../controller/job.controller.js");

  // Create a new Job
  app.post("/job", jobs.create);

  // Retrieve all Jobs
  app.get("/getJobs", jobs.findAll);

  // Update a job with new Status
  app.put("/jobStatus", jobs.updateStatus);

};
