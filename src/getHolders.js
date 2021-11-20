const axios = require('axios');
const fs = require('fs');

axios.get('https://api.bscscan.com/api?module=account&action=tokennfttx&contractaddress=0x360673a34cf5055dfc22c53bc063e948a243293b&address=0x0000000000000000000000000000000000000000&page=1&offset=10000&startblock=10674026&endblock=12760620&sort=asc&apikey=YourApiKeyToken')
.then(response => {
    let data = response.data.result;
    let res = [];
    let temp = {};
    let total = 0;
    for(let i = 0; i < data.length; i++) {
        if (temp[data[i]['to']] == undefined) {
            temp[data[i]['to']] = 0;
        }
        temp[data[i]['to']] += 1;
        total += 1;
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
