const Job = require("../model/job");
const amqp = require('amqplib/callback_api')

// Create and Save a new Customer
exports.create = (req, res) => {
  // Validate request
  if (!req.body) {
    res.status(400).send({
      message: "Content can not be empty!"
    });
  }

  // Create a Customer
  const job  = new Job({
  Project:req.body.Project,
  Priority:req.body.Priority,
  Status:'scheduled',
  Data:req.body.Data,
  CreatedAt: (new Date()).toISOString(),
  LastTimeStamped:(new Date()).toISOString(),
  IsSilenced:false
  });


  amqp.connect('amqp://localhost',+ "?heartbeat=60", (err, conn) => {
    // Create channel
    conn.createChannel((err, ch) => {
      // Naming
      const queue = 'jobQueue';
      //declaration
      ch.assertQueue(queue, { durable: false })

      // Send message to the queue
      ch.sendToQueue(queue, new Buffer(JSON.stringify(job)));

      if (err)
        res.status(500).send({
          message:
            err.message || "Some error occurred while creating new jobs."
        });
      else
        res.send('Message is being sent successfully');
    })
  })

  // Save Customer in the database

};

// Retrieve all important jobs from the database.
exports.findAll = (req, res) => {
 Job.getTop1((err, data) => {
    if (err)
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving customers."
      });
    else {
      if(data.status === 'scheduled')
      {
        data.status = 'processing'
      }
      res.send(data)
    }
  });
};

// Update job status from the database.
exports.updateStatus = (req, res) => {
  Job.updateStatus(req.body.id,req.body.status,(err, data) => {
    if (err)
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving customers."
      });
    else res.send(data);
  });
};

