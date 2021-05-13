•	How should concurrency be handled if there are multiple instances of this microservice running?



Database concurrency is the ability of the database to support multiple users and processes working on the database concurrently. 
Read write locks: Systems that deal with concurrent read/write access typically implement a locking system that consists of two lock types. We can use SELECT … FROM <table> WITH (UPDLOCK) in SQL Server.



In mysql relational database only one write happens at one point and so we can move to other horizontal Db like NoSQL Cassandra where availability is primary importance.  It provides high availability, high scalability and the side-effect being Cassandra is used for large data and not structural data where frequent writes do not happen


Zookeeper: Relational databases offer strong transactional guarantees which usually come at a cost but are often not required for managing application metadata. For large queries we can use transactions. So, it makes sense to look for a more specialized solution such as Zookeeper where we have a centralized service for maintaining configuration information, naming, providing store and the disadvantage being Zookeeper stores all its data in memory (which limits its use cases), resulting in highly performant reads.


A distributed SQL database is a single relational database which replicates data across multiple servers. Distributed SQL databases are strongly consistent and most support consistency across racks, data centers, and wide area networks including cloud availability zones and cloud geographic zones. MariadB expand is one such example

Sharding in distributed sql: A distributed SQL database needs to automatically partition the data in a table and distribute it across nodes. This is known as data sharding and it can be achieved through different strategies.  It can have a huge performance impact since the entire cache will have to be warmed again. Ex: DynamoDB and Cassandra




Eventual consistency is a consistency model used in distributed computing to achieve high availability that informally guarantees that, if no new updates are made to a given data item, eventually all accesses to that item will return the last updated value.For us avialbility is a concern but read writes is also one.


In our solution we have isolated data writes with reads; data reads are always available via redis or simple sql query and all the write operations are fed to the rabbitmq and handled accordingly by the queue. Messages are routed through exchanges before arriving at queues. RabbitMQ features several built-in exchange types for typical routing logic. For more complex routing you can bind exchanges together or even write your own exchange type as a plugin. Queues can be mirrored across several machines in a cluster, ensuring that even in the event of hardware failure your messages are safe. There are RabbitMQ clients for almost any language you can think of.We can debug the message queue and the failked message itself from the rabbitmq UI. We are also using redis complimented caching to ijmprove availability and increase scope for multi client . In Redis 2.4 there was a hard-coded limit for the maximum number of clients that could be handled simultaneously. In Redis 2.6 this limit is dynamic: by default, it is set to 10000 clients, unless otherwise stated by the maxclients directive in Redis.








•	The job table can be very large, how should indexing and work?





There are 2 types of indexing clustered and no. clustered. Indexing makes the searching process easier be employing tree-based search. Indexes are automatically created when PRIMARY KEY and UNIQUE constraints are defined on table columns. We have set up primary key for our table. Also in future use cases where we have to perform clustered index on a certain field where we might do most searching upon like date(createdAt ) or lastTimeStamped. We can use crate db too CrateDB combines the speed and scalability of NoSQL with the ease of use and interoperability of SQL databases, providing a distributed database architecture that can store and analyze massive amounts of machine data in real-time. So instead of saving a json object directly; all the hierarchial json data can be split into individual key avlues like     a[0].b.c[0].d  can be made a key with its value. The json is horizontally scaled.







•	What optimizations can be done to improve pruning of data after a given date, e.g. 30 days, given there could be hundreds of thousands, or millions of entries?





I have already made partial implementation for this problem. We have fields lastUpdatedTime and isSilenced fields in the database. We will have monthly running background job which regulates the data inside MySQL by setting silenced = true. This will silence out this job and lets us know to ignore them. This can be either marked for deletion later or separate history of job events can be stored elsewhere












Our solution: we have 2 separate servers(one of them is background running server).It always polls for rabbit mq message requests and process them.It also has a periodic job that actually checks the redis datastore and see if the count of entries are less than a particular number(say 5) then insert entries from sql to redis in a sorted set way with timestamp being the key. This makes the queue always ready.

Other server is a clienbt server which handles api handlers and express routing to perform 3 handlers 
1.create job entries to mysql using rabbitmq send message to handle the write activity
2. getthetoppicked job by looking into redis first to get the oldest one first and rhen look into the sql db to get data sorted on priority first and date next
3.Another handler to update the status of job from client.

We are trying to achieve scaling availability multi programming , persistence and dbbackup through this architecture.


















