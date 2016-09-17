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
- Queries are extremely quick.

The drawbacks:

- Only two kinds of keys with which query can be made: partition and sort keys.
So querying with DynamoDB is quite limited.
- Writes are around 5 times more expensive that reads.
- API may be hard to handle at the beginning.

Basically, if you have a huge amount of non-relational data that you want to
query quickly, then DynamoDB is for you. DynamoDB is for example very popular in
Japan within the mobile game industry, as it allows for lightning-quick data
retrieval, thus sparing users from constant lag during the game.

With DynamoDB, you can easily query by partition key more than 10000 elements
(around 2MB of data) over the network in less than a second. And as said earlier,
no matter how big is your dataset, query time is independent. Only the amount
of matching keys matters.

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

Let's suppose we have a **products** table, designed like this:

| Table | Partition Key | Partition Key Type | Sort Key | Sort Key Type |
| ----- | ----- | ----- | ----- | ----- |
| products | productKey | string (S) | date | number (N) |

The other attributes of the document representing a product can be anything.
Then we can query all the products with the key `fooKey` like this:

```js
var dynamodb = new AWS.DynamoDB();

var params = {
    TableName: "products",
    KeyConditionExpression: "#key = :productKey",
    ExpressionAttributeNames: {
        "#key": "productKey"
    },
    ExpressionAttributeValues: {
        ":productKey": {
            "S": "fooKey"
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
**data.Items** will contain the queried objects.

### Format output to clean JSON

However, the format of the **data** object is like this:


```json
{
    "Items": [
        {
            "payload": {
                "M": {
                    "broken": { "BOOL": "false" },
                    "userComments": {
                        "L": [
                            { "S": "A somewhat good product." },
                            { "S": "Awesome!" },
                            { "S": "I was very dissatisfied!" }
                        ]
                    }
                }
            },
            "productKey": { "S": "fooKey" },
            "date": { "N": "1472273487869" }
        }, ...
    ]
}
```

which can be quite inconvenient to work with. So let's remove all the data type
identifies ("S", "L" and so on) with a `processQueryOutput` function.

```js
dynamodb.query(params, function(err, data) {
    if (err) {
        // Handle error
    } else {
        var items = processQueryOutput(data);
        // continue working with items...
    }
});
```

Where `processQueryOutput` is defined as such:

```js
function processQueryOutput(data) {
    var items = [];
    for (var i = 0; i < data.Items.length; i++) {
        items.push(processQueryOutputSingleItem(data.Items[i]));
    }
    return items;
}

function processQueryOutputSingleItem(queryItem) {
    var item = {};
    for (var key in queryItem) {
        item[key] = processKeyContent(queryItem[key]);
    }
    return item;
}

function processKeyContent(content) {
    if ("S" in content) {
        return content.S;
    } else if ("N" in content) {
        return parseFloat(content.N);
    } else if ("L" in content) {
        var list = [];
        for (var j = 0; j < content.L.length; j++) {
            list.push(processKeyContent(content.L[j]));
        }
        return list;
    } else if ("BOOL" in content) {
        return content.BOOL;
    } else if ("NULL" in content) {
        return content.NULL;
    } else if ("M" in content) {
        return processQueryOutputSingleItem(content.M);
    } else {
        // DynamoDB defines a few more types, you are free to add a condition
        // to handle them if need be.
        throw `This item has a key with an unknown data type: ${content}`;
    }
}
```

That may be quite long, but you have finally a beautifully processed output.
For the above file, we should obtain that:

```json
[
    {
        "payload": {
            "broken": false,
            "userComments": ["A somewhat good product.", "Awesome!", "I was very dissatisfied!"]
        },
        "productKey": "fooKey",
        "date": 1472273487869
    }, ...
]
```
That's all folks!

### Get data recursively for dataset larger than 1MB.

Another thing worth noting is that if the queryset is larger than 1MB, it will
be truncated. To go around it, we must recursively query the remaining documents
until we have everything. Thankfully, it is quite easily done with DynamoDB.

The following example should only be done if you know your box has enough memory
to handle all the incoming data. We will create a `queryLargeDataSets` function
as follow:

```js
function queryLargeDataSets(params, done) {
    innerFunction(params, { Items: [] }, done);
}

function innerFunction(params, retrievedData, done) {
    dynamodb.query(params, function(err, data) {
        if (err) {
            done(err, null);
        } else {
            retrievedData.Items.push(...(data.Items));
            // The LastEvaluatedKey attribute is there if part of the data
            // was truncated.
            if (data.LastEvaluatedKey) {
                params.ExclusiveStartKey = data.LastEvaluatedKey;
                innerFunction(params, retrievedData, done);
            } else {
                // retrievedData now contains all the objects corresponding to
                // the query parameters
                done(err, retrievedData);
            }
        }
    });
}
```

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

There you have a DynamoDB instance running on your PC! You just need to create
the <span style="white-space: nowrap">*populate-dynamodb-script.js*</span> file to populate the DB before starting
hacking.

Please leave comments if you have anything to say <i class="fa fa-smile-o"></i>.
