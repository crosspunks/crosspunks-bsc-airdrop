const axios = require('axios');
const HTML = require('node-html-parser');
const fs = require('fs');

const address = '0x360673a34cf5055dfc22c53bc063e948a243293b';

let total_supply = 0;

let res = [];
let resTS = 0;

async function main() {
    await axios.get('https://api.bscscan.com/api?module=stats&action=tokensupply&contractaddress=0x360673a34cf5055dfc22c53bc063e948a243293b&apikey=YourApiKeyToken')
    .then(function (response) {
        total_supply = parseInt(response.data.result);
        //console.log(response.data.result);
    })
    .catch(function (error) {
        console.log(error);
    });
    let p = 1;
    let whileTrue = true;
    while (whileTrue) {
        await axios.get('https://bscscan.com/token/generic-tokenholders2?a=' + address + '&sid=&m=normal&p=' + p)
        .then(function (response) {
            let html = response.data;

            let trs = HTML.parse(html).querySelector('tbody').querySelectorAll('tr');

            trs.forEach(element => {
                //console.log(element.querySelector('a').text); 
                //console.log(element.querySelectorAll('td')[2].text);

                resTS += parseInt(element.querySelectorAll('td')[2].text);
                
                if (element.querySelector('a').text != '0x36894d06ac91b09760b4310c75ed2348e3ea063c') {
                    res.push({
                        'address': element.querySelector('a').text,
                        'value': element.querySelectorAll('td')[2].text
                    });
                }
            });

            if (trs.length == 50) {
                p++;
            } else {
                whileTrue = false;
            }
        })
        .catch(function (error) {
            console.log(error);
        });
    }

    if (resTS != total_supply ) {
        console.log("ERROR!");
    }
    
    fs.writeFile("holders.json", JSON.stringify(res), function(err) {
        if (err) {
            console.log(err);
        }
    });
}

main();