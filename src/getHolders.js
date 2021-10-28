const axios = require('axios');
const fs = require('fs');

axios.post('https://graphql.bitquery.io/', {
    "query":"query ($network: EthereumNetwork!, $token: String!, $zero: String!, $limit: Int!, $offset: Int!, $from: ISO8601DateTime) {\n  ethereum(network: $network) {\n    transfers(\n      options: {desc: \"block.timestamp.time\", limit: $limit, offset: $offset}\n      date: {since: $from}\n      amount: {gt: 0}\n      currency: {is: $token}\n      sender: {is: $zero}\n    ) {\n      block(time: {before: \"2021-10-28T12:25:30.000Z\"}) {\n        timestamp {\n          time(format: \"%Y-%m-%d %H:%M:%S\")\n        }\n      }\n      sender {\n        address\n      }\n      receiver {\n        address\n      }\n      currency {\n        symbol\n      }\n      count\n      transaction {\n        hash\n      }\n    }\n  }\n}\n",
    "variables":"{\"limit\":1000,\"offset\":0,\"network\":\"bsc\",\"token\":\"0x360673a34cf5055dfc22c53bc063e948a243293b\",\"zero\":\"0x0000000000000000000000000000000000000000\",\"from\":\"2021-09-06\",\"dateFormat\":\"%Y-%m-%d\"}"
}).then(response => {
    let data = response.data.data.ethereum.transfers;
    let res = [];
    let temp = {};
    let total = 0;
    for(let i = 0; i < data.length; i++) {
        if (temp[data[i]['receiver']['address']] == undefined) {
            temp[data[i]['receiver']['address']] = 0
        }
        temp[data[i]['receiver']['address']] += data[i]['count']
        total += data[i]['count']
    }

    console.log(total);

    for (const [key, value] of Object.entries(temp)) {
        res.push({
            'address': key,
            'value': value
        });
    }

    fs.writeFile("holders.json", JSON.stringify(res), function(err) {
        if (err) {
            console.log(err);
        }
    });
}).catch(error => {
    console.log(error);
});
