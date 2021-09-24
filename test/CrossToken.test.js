const { expect } = require('chai');
const { BN, expectRevert, ether, time } = require('@openzeppelin/test-helpers');

const CrossToken = artifacts.require('CrossToken');

contract('CrossToken', (accounts) => {
    const owner = accounts[0];
    const guy = accounts[1];
    const a1 = accounts[2];
    const a2 = accounts[3];

    const totalSupply = ether('55000000');

    beforeEach(async () => {
        this.token = await CrossToken.new({ from: owner });
    });

    describe('metadata', () => {
        it('has given name', async () => {
            const name = await this.token.name();
            expect(name).to.be.equal("CrossToken");
        });
    
        it('has given symbol', async () => {
            const symbol = await this.token.symbol();
            expect(symbol).to.be.equal("CST");
        });

        it('has given decimals', async () => {
            const decimals = await this.token.decimals();
            expect(decimals).to.be.bignumber.equal(new BN(18));
        });

        it('has given totalSupply', async () => {
            const realTotalSupply = await this.token.totalSupply();
            expect(realTotalSupply).to.be.bignumber.equal(totalSupply);
        });
    });

    describe('balanceOf', () => {
        it('grants to initial account', async () => {
            const balance = await this.token.balanceOf(owner);
            expect(balance).to.be.bignumber.equal(totalSupply);
        });
    });

    describe('numCheckpoints', () => {
        it('returns the number of checkpoints for a delegate', async () => {
            await this.token.transfer(guy, new BN('100'));
            expect(await this.token.balanceOf(guy)).to.be.bignumber.equal(new BN('100'));

            expect(await this.token.numCheckpoints(a1)).to.be.bignumber.equal(new BN(0));

            const t1 = await this.token.delegate(a1, { from: guy });
            expect(await this.token.numCheckpoints(a1)).to.be.bignumber.equal(new BN(1));

            const t2 = await this.token.transfer(a2, new BN('10'), { from: guy });
            expect(await this.token.numCheckpoints(a1)).to.be.bignumber.equal(new BN(2));

            const t3 = await this.token.transfer(a2, new BN('10'), { from: guy });
            expect(await this.token.numCheckpoints(a1)).to.be.bignumber.equal(new BN(3));

            const t4 = await this.token.transfer(guy, new BN('20'), { from: owner });
            expect(await this.token.numCheckpoints(a1)).to.be.bignumber.equal(new BN(4));

            var { fromBlock, votes } = await this.token.checkpoints(a1, 0);
            expect(fromBlock).to.be.bignumber.equal(new BN(t1.receipt.blockNumber));
            expect(votes).to.be.bignumber.equal(new BN('100'));

            var { fromBlock, votes } = await this.token.checkpoints(a1, 1);
            expect(fromBlock).to.be.bignumber.equal(new BN(t2.receipt.blockNumber));
            expect(votes).to.be.bignumber.equal(new BN('90'));

            var { fromBlock, votes } = await this.token.checkpoints(a1, 2);
            expect(fromBlock).to.be.bignumber.equal(new BN(t3.receipt.blockNumber));
            expect(votes).to.be.bignumber.equal(new BN('80'));

            var { fromBlock, votes } = await this.token.checkpoints(a1, 3);
            expect(fromBlock).to.be.bignumber.equal(new BN(t4.receipt.blockNumber));
            expect(votes).to.be.bignumber.equal(new BN('100'));
        });

        it('does not add more than one checkpoint in a block', async () => {
        });
    });

    describe('getPriorVotes', () => {
        it('reverts if block number >= current block', async () => {
            await expectRevert(this.token.getPriorVotes(a1, 5e10), "CrossToken::getPriorVotes: not yet determined");
        });

        it('returns 0 if there are no checkpoints', async () => {
            expect(await this.token.getPriorVotes(a1, 0)).to.be.bignumber.equal(new BN(0));
        });

        it('returns the latest block if >= last checkpoint block', async () => {
            const t1 = await this.token.delegate(a1, { from: owner });
            await time.advanceBlock();
            await time.advanceBlock();

            expect(await this.token.getPriorVotes(a1, t1.receipt.blockNumber)).to.be.bignumber.equal(new BN('55000000000000000000000000'));
            expect(await this.token.getPriorVotes(a1, t1.receipt.blockNumber + 1)).to.be.bignumber.equal(new BN('55000000000000000000000000'));
        });

        it('returns zero if < first checkpoint block', async () => {
            await time.advanceBlock();
            const t1 = await this.token.delegate(a1, { from: owner });
            await time.advanceBlock();
            await time.advanceBlock();

            expect(await this.token.getPriorVotes(a1, t1.receipt.blockNumber - 1)).to.be.bignumber.equal(new BN('0'));
            expect(await this.token.getPriorVotes(a1, t1.receipt.blockNumber + 1)).to.be.bignumber.equal(new BN('55000000000000000000000000'));
        });

        it('generally returns the voting balance at the appropriate checkpoint', async () => {
            const t1 = await this.token.delegate(a1, { from: owner });
            await time.advanceBlock();
            await time.advanceBlock();
            const t2 = await this.token.transfer(a2, new BN('10'), { from: owner });
            await time.advanceBlock();
            await time.advanceBlock();
            const t3 = await this.token.transfer(a2, new BN('10'), { from: owner });
            await time.advanceBlock();
            await time.advanceBlock();
            const t4 = await this.token.transfer(owner, new BN('20'), { from: a2 });
            await time.advanceBlock();
            await time.advanceBlock();

            expect(await this.token.getPriorVotes(a1, t1.receipt.blockNumber - 1)).to.be.bignumber.equal(new BN('0'));
            expect(await this.token.getPriorVotes(a1, t1.receipt.blockNumber)).to.be.bignumber.equal(new BN('55000000000000000000000000'));
            expect(await this.token.getPriorVotes(a1, t1.receipt.blockNumber + 1)).to.be.bignumber.equal(new BN('55000000000000000000000000'));

            expect(await this.token.getPriorVotes(a1, t2.receipt.blockNumber)).to.be.bignumber.equal(new BN('54999999999999999999999990'));
            expect(await this.token.getPriorVotes(a1, t2.receipt.blockNumber + 1)).to.be.bignumber.equal(new BN('54999999999999999999999990'));

            expect(await this.token.getPriorVotes(a1, t3.receipt.blockNumber)).to.be.bignumber.equal(new BN('54999999999999999999999980'));
            expect(await this.token.getPriorVotes(a1, t3.receipt.blockNumber + 1)).to.be.bignumber.equal(new BN('54999999999999999999999980'));

            expect(await this.token.getPriorVotes(a1, t4.receipt.blockNumber)).to.be.bignumber.equal(new BN('55000000000000000000000000'));
            expect(await this.token.getPriorVotes(a1, t4.receipt.blockNumber + 1)).to.be.bignumber.equal(new BN('55000000000000000000000000'));
        });
      });
});