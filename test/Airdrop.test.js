const { expect } = require('chai');
const { BN, expectRevert, ether } = require('@openzeppelin/test-helpers');

const Token = artifacts.require('Token');
const Airdrop = artifacts.require('Airdrop');

contract('Airdrop', (accounts) => {
    const owner = accounts[0];
    const r1 = accounts[1];
    const r2 = accounts[2];

    const totalSupply = ether('55000000000');

    beforeEach(async () => {
        this.token = await Token.new({ from: owner });
        this.airdrop = await Airdrop.new(this.token.address, { from: owner });

        const realTotalSupply = await this.token.totalSupply();
        expect(realTotalSupply).to.be.bignumber.equal(totalSupply);

        await this.token.transfer(this.airdrop.address, totalSupply);

        const balanceAirdrop = await this.token.balanceOf(this.airdrop.address);
        expect(balanceAirdrop).to.be.bignumber.equal(totalSupply);
    });

    it('has correct', async () => {
        await expectRevert(this.airdrop.airdrop([r1, r2], [4]), "The number of recipients is not equal to the number of values");
        await expectRevert(this.airdrop.airdrop([r1, r2], [4, 0]), "Balance less than zero");

        await this.airdrop.airdrop([r1, r2], [4, 2]);

        const r1Balance = await this.token.balanceOf(r1);
        expect(r1Balance).to.be.bignumber.equal(ether('4000'));
        const r2Balance = await this.token.balanceOf(r2);
        expect(r2Balance).to.be.bignumber.equal(ether('2000'));

        const balanceAirdrop = await this.token.balanceOf(this.airdrop.address);
        expect(balanceAirdrop).to.be.bignumber.equal(totalSupply.sub(ether('6000')));
    });
});