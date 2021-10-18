const Airdrop = artifacts.require('./Airdrop');
const CrossToken = artifacts.require('./CrossToken');

const holders = require('../holders.json');

const ether = (n) => web3.utils.toWei(n, 'ether');

module.exports = function(deployer) {
    deployer.then(async () => {
        // const ct = await deployer.deploy(CrossToken);
        // await deployer.deploy(Airdrop, ct.address);

        // Testnet
        const ad = await Airdrop.at('0x36894d06ac91B09760b4310C75Ed2348E3eA063C');
        const ct = await CrossToken.at('0xc0a531900a80c4eb36e4f42019ee986b89d55e03');

        // const totalSupply = ether('55000000');
        // await ct.transfer(ad.address, totalSupply);

        let len = holders.length;

        console.log("Count address: " + len);

        for(let i = 0; i <= len; i += 100) {
            let address = [];
            let value = [];

            for(let j = i; j < i + 100 && j < len; j++) {
                address.push(holders[j].address);
                value.push(holders[j].value);
            }

            await ad.airdrop(address, value);
        }
    });
};