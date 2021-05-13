const express = require("express");
const bodyParser = require("body-parser");
const amqp = require('amqplib/callback_api');
const redis = require("redis");
const client = redis.createClient(6379, 'localhost');


const app = express();

// parse requests of content-type - application/json
app.use(bodyParser.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));


// set port, listen for requests
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  const Job = require("../model/job");

  function function2() {
    client.zcount('jobs','-inf' ,'+inf'
      ,function(err,res){
      if( res<= 5 )
      {
        Job.getTop5((err, data) => {
          if (err)
            res.status(500).send({
              message:
                err.message || "Some error occurred while retrieving customers."
            });
          else
          if(data)
          {
            let arrdat = [];
            for(let j=0;j<data.length;j++)
            {
              arrdat.push(new Date(data[j].CreatedAt).getTime() ,JSON.stringify(data[j]))
            }
            if(arrdat.length>0)
            client.zadd('jobs',arrdat,function(err, reply) {
              if (reply >=0) {
                // reply is null when the key is missing
                let jobs = JSON.parse(reply);

                amqp.connect('amqp://localhost',+ "?heartbeat=60", (err, conn) => {
                  // Create channel
                  conn.createChannel((err, ch) => {
                    // Naming
                    const queue = 'jobStatusQueue';
                    //declaration
                    ch.assertQueue(queue, { durable: true })

                    // Send message to the queue
                    ch.sendToQueue(queue, new Buffer(JSON.stringify(data)));


                  })
                })
              }
            })


          }

        })

      }

    })
  }

// Create connection
  amqp.connect('amqp://localhost',+ "?heartbeat=60", (err, conn) => {
    // Create channel
    conn.createChannel((err, channel) => {
      // Naming
      const queue = 'jobQueue';
      const statusQueue = 'jobStatusQueue';
      // Declare the queue
      channel.assertQueue(queue, { durable: false })

      channel.consume( queue, msg => {
        Job.create(JSON.parse(msg.content.toString()))
        }, { noAck: true }
      );

      channel.consume( statusQueue, msg => {
        var msgArr= JSON.parse(msg.content.toString());
          for (let i = 0; i < msgArr.length; i++) {
/*            client.hmset('jobs', msgArr.id, JSON.stringify(msgArr), function (err,res) {
              console.log(res);
              Object.values(msgArr)

            });*/
            Job.updateStatuswithNoCallBack(Object.values(msgArr[i])[Object.keys(msgArr[i]).indexOf('Id')],'Processing');
          }

      }, { noAck: true });

      setInterval(function2, 1000);

    })
  })
});