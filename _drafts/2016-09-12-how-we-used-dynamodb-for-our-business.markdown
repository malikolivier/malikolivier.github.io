---
layout: post
title: Some DynamoDB tips
language: en
keywords: programming dynamodb
---

## Why use DynamoDB?

DynamoDB is a NoSQL-like database provided by Amazon Web Services.
It favors querying speed over consistency and does not have any support for
relationship out of the box.

I am going to describe a few qualities of DynamoDB:

- Query time depends only on the amount of fetched items. That means that if the
- AWS charges on the number of write/read. Storage space is not taken into
account.

The drawbacks:

- Only two IDS
- Writes are around 5 times more expensive that read
- API may be hard to handle at the beginning

Basically, if you have a huge amount of non-relational data that you want to
query quickly, then DynamoDB is for you. DynamoDB is for example very popular in
Japan within the mobile game industry, as it allows for lightning-quick data
retrieval, thus sparing users from constant lag during the game.

## Some code snippets for Node

AWS provides two documentations:

- [GettingStarted](http://docs.aws.amazon.com/amazondynamodb/latest/gettingstartedguide/GettingStarted.NodeJs.html):
The bare minimum to survive in this hostile world. We would like to have more info though.
- [API specification](http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB.html):
This one, though exhaustive, is very hard to read: no example, no code snippet.

We will for example show how to get more than 1MB worth of documents.
Indeed, DynamoDB will interrupt the request when 1MB documents or more are
fetched.

We will see as well how to format the query output to clean JSON.

Though the AWS SDK is supplied in a variety of programming languages, we will be
using Node.js for our examples.

### Get data

Let's suppose we have a `products` table, designed like this:

| Table | Range Key | Range Key Type |
| ----- | ----- | ----- |
| products | productId | string (S) |

```js
var dynamodb = new AWS.DynamoDB();

var params = {
    TableName: "products",
    KeyConditionExpression: "#id = :productId",
    ExpressionAttributeNames: {
        "#id": "productId"
    },
    ExpressionAttributeValues: {
        ":productId": {
            "S": productId
        }
    }
};
dynamodb.query(params, function(err, data) {
    if (err) {
      // Handle error
    } else {
      // Process data
    }
});
```

### Get data with conditions


### Format output to clean JSON


### Get data recursively for dataset larger than 1MB.


## DynamoDB Local


If you want to test on DynamoDB on local, it is possible!
Running you test environment connected to AWS will indeed cost you money for
each read/write.

You will need to have a JRE installed on your box to run DynamoDB Local.

First, download and unzip DynamoDB Local:

```shell
wget http://dynamodb-local.s3-website-us-west-2.amazonaws.com/dynamodb_local_latest.zip
unzip dynamodb_local_latest.zip
```

DynamoDB Local by default will run in memory.
I personally use a shell script to start DynamoDB and populate it.

```shell
java -Djava.library.path=DynamoDBLocal_lib -jar DynamoDBLocal.jar -sharedDb -inMemory &
DYNAMODB_PID=$!
echo "DynamoDB PID: $DYNAMODB_PID"
trap "echo 'Killing DynamoDB with PID: $DYNAMODB_PID'; kill $DYNAMODB_PID" INT
# We sleep 1 second to wait for DynamoDB to be up and ready.
sleep 1s
# Then we populate DynamoDB
node populate-dynamodb-script.js
```

We use `trap` to kill the DynamoDB process when SIGINT is sent to the shell process.
If you do not do that, DynamoDB will go on running in the background for ever
even when you push Ctrl-C.
