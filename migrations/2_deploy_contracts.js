const Airdrop = artifacts.require('./Airdrop');
const CrossToken = artifacts.require('./CrossToken');

const holders = require('../holders.json');

const ether = (n) => web3.utils.toWei(n, 'ether');

module.exports = function(deployer) {
    deployer.then(async () => {
        // const ct = await deployer.deploy(CrossToken);
        // const ad = await deployer.deploy(Airdrop, ct.address);

        // Mainnet
        const ad = await Airdrop.at('0xe6372344627fC54BBA8F96F89fa3F0e6bc10fBeC');
        const ct = await CrossToken.at('0x014be200c192bD8366dF781a96cec51B3D9Dcd93');

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