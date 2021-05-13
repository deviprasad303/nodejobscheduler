#!/usr/bin/env node
const amqp = require('amqplib/callback_api');
const Job = require("../model/job");

// Create connection
amqp.connect('rabbitmqhost',+ "?heartbeat=60", (err, conn) => {
  // Create channel
  conn.createChannel((err, ch) => {
    // Name of the queue
    const q = 'jobQueue'
    // Declare the queue
    ch.assertQueue(q, { durable: false })

    // Send message to the queue
    ch.sendToQueue(q, new Buffer(msg));
    console.log(" {x} Sent 'Hello World'")

    // Close the connection and exit
    setTimeout(() => {
      conn.close();
    }, 500)
  })
})
