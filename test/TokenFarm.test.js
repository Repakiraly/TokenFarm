const { assert } = require("chai")


const DaiToken = artifacts.require("DaiToken")
const DappToken = artifacts.require("DappToken")
const TokenFarm = artifacts.require("TokenFarm")

require("chai")
    .use(require("chai-as-promised"))
    .should()

function tokens(n){
    return web3.utils.toWei(n, "Ether")
}

contract("TokenFarm", ([owner, investor]) =>{
    let daiToken, dappToken, tokenFarm


    before(async() => {
        daiToken = await DaiToken.new() 
        dappToken = await DappToken.new()
        tokenFarm = await TokenFarm.new(dappToken.address,daiToken.address)
        
        //Transfer Dapp TOkens to TokenFarm
        await dappToken.transfer(tokenFarm.address,tokens("1000000"))

        //Send TOkens to Investor
        await daiToken.transfer(investor, tokens('100'), {from: owner})
    })

    describe("Mock Dai Deployment", async() => {
        it("has a name", async() => {
            const name = await daiToken.name()
            assert.equal(name, "Mock DAI Token")
        })

        it("contract has balance", async() => {
            let balance = await daiToken.balanceOf(investor)
            assert.equal(balance.toString(), tokens('100'))
        })
    })

    describe("Dapp Token Deployment", async() => {
        it("has a name", async() => {
            const name = await dappToken.name()
            assert.equal(name, "DApp Token")
        })
    })

    describe("Token Farm Deployment", async() => {
        it("has a name", async() => {
            const name = await tokenFarm.name()
            assert.equal(name, "DApp TOken Farm")
        })

        it("contract has balance", async() => {
            let balance = await dappToken.balanceOf(tokenFarm.address)
            assert.equal(balance.toString(), tokens("1000000"))
        })
    })

    describe("Farming tokens", async() =>{
        it("rewards investors for staking Dai", async() => {
            
            //check the balance before the deposit
            let balance = await daiToken.balanceOf(investor)
            assert.equal(balance.toString(), tokens('100'))

            await daiToken.approve(tokenFarm.address, tokens("100"), {from: investor})
            await tokenFarm.stakeTokens(tokens("100"), {from: investor})
            //Check balances after staking
            balance = await daiToken.balanceOf(investor)
            assert.equal(balance.toString(), tokens('0'))

            balance = await daiToken.balanceOf(tokenFarm.address)
            assert.equal(balance.toString(), tokens('100'))

            balance = await tokenFarm.stakingBalance(investor)
            assert.equal(balance.toString(), tokens('100'))

            //Is staking?
            balance = await tokenFarm.isStaking(investor)
            assert.equal(balance.toString(), 'true', "User is staking")
 
            //Issue Tokens
            await tokenFarm.issueTokens({from: owner})

            //CHeck balances after issuing
            balance= await dappToken.balanceOf(investor)
            assert.equal(balance.toString(), tokens('100'),'Investor gets 100 Tokens frim Issuing')
            //Ensure only owner can issue token
            await tokenFarm.issueTokens({from: investor}).should.be.rejected
        
            //Unstake tokens
            await tokenFarm.unstakeTokens({from: investor});

            //Check result after unstake
            balance = await daiToken.balanceOf(investor)
            assert.equal(balance.toString(), tokens('100'), 'Investor Dai wallet balance correct');


            balance = await daiToken.balanceOf(tokenFarm.address)
            assert.equal(balance.toString(), tokens('0'), 'TokenFarm Dai wallet balance correct');

            balance = await tokenFarm.stakingBalance(investor)
            assert.equal(balance.toString(), tokens('0'), 'Investor TokenFarm wallet balance correct');

            balance = await tokenFarm.isStaking(investor)
            assert.equal(balance.toString(), 'false', 'Investor is no longer staking');
        })
    })
})