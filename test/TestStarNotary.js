// Udacity Blockchain Developer Nanodegree
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
const StarNotary = artifacts.require("StarNotary");

var accounts;
var owner;

contract('StarNotary', (accs) => {
    accounts = accs;
    owner = accounts[0];
});

it('can create a Star', async() => {
    let tokenId = 1;
    let instance = await StarNotary.deployed();
    let starName = 'Mizar';
    await instance.createStar(starName, tokenId, {from: accounts[0]});
    assert.equal(await instance.tokenIdToStarInfo.call(tokenId), starName);
});

it('lets user1 put up her star for sale', async() => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let starId = 2;
    let starPrice = web3.utils.toWei(".01", "ether");
    await instance.createStar('Alkor', starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    assert.equal(await instance.starsForSale.call(starId), starPrice);
});

it('lets user1 receive the funds after the sale', async() => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let user2 = accounts[2];
    let starId = 3;
    let starPrice = web3.utils.toWei(".01", "ether");
    let balance = web3.utils.toWei(".05", "ether");
    let starName = 'Sun';
    await instance.createStar(starName, starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user1);
    await instance.buyStar(starId, {from: user2, value: balance});
    let balanceOfUser1AfterTransaction = await web3.eth.getBalance(user1);
    let value1 = Number(balanceOfUser1BeforeTransaction) + Number(starPrice);
    let value2 = Number(balanceOfUser1AfterTransaction);
    assert.equal(value1, value2);
});

it('lets user2 buy a star that is put up for sale', async() => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let user2 = accounts[2];
    let starId = 4;
    let starPrice = web3.utils.toWei(".01", "ether");
    let balance = web3.utils.toWei(".05", "ether");
    await instance.createStar('Proxima Centauri', starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user2);
    await instance.buyStar(starId, {from: user2, value: balance});
    assert.equal(await instance.ownerOf.call(starId), user2);
});

it("decreases user2's ether balance after buying a star", async() => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let user2 = accounts[2];
    let starId = 5;
    let starPrice = web3.utils.toWei(".01", "ether");
    let balance = web3.utils.toWei(".05", "ether");
    await instance.createStar('Sirius', starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user2);
    const balanceOfUser2BeforeTransaction = await web3.eth.getBalance(user2);
    await instance.buyStar(starId, {from: user2, value: balance, gasPrice:0});
    const balanceAfterUser2BuysStar = await web3.eth.getBalance(user2);
    let value = Number(balanceOfUser2BeforeTransaction) - Number(balanceAfterUser2BuysStar);
    assert.equal(value, starPrice);
});
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - |

// II. Unit Tests
it('adds the token name and symbol properly', async() => {
    let instance = await StarNotary.deployed();
    let tokenName = await instance.name.call();
    let tokenSymbol = await instance.symbol.call();
    assert.equal(tokenName, "Nostarize Exchange Token");
    assert.equal(tokenSymbol, "NOSEXT");
});

it('lets 2 users exchange stars', async() => {
    let instance = await StarNotary.deployed();
    let starIdA = 7;
    let starNameA = "Alpha Centauri A";
    let userAlice = accounts[1];
    let starIdB = 8;
    let starNameB = "Alpha Centauri B";
    let userBob = accounts[2];
    // 1. Create 2 Stars with different tokenIds
    await instance.createStar(starNameA, starIdA, {from: userAlice});
    await instance.createStar(starNameB, starIdB, {from: userBob});
    // 2. Call the exchangeStars function implemented in the Smart Contract
    let ownerOfStarABeforeExchange = await instance.ownerOf.call(starIdA);
    let ownerOfStarBBeforeExchange = await instance.ownerOf.call(starIdB);
    await instance.exchangeStars(starIdA, starIdB, {from: userAlice});
    let ownerOfStarAAfterExchange = await instance.ownerOf.call(starIdA);
    let ownerOfStarBAfterExchange = await instance.ownerOf.call(starIdB);
    // 3. Verify that the owners have changed
    assert.equal(ownerOfStarABeforeExchange, ownerOfStarBAfterExchange);
    assert.equal(ownerOfStarBBeforeExchange, ownerOfStarAAfterExchange);
});

it('lets a user transfer a star', async() => {
    let instance = await StarNotary.deployed();
    let starId = 9;
    let starName = "Antares";
    let userAlice = accounts[1];
    let userBob = accounts[2];
    // 1. Create a Star with a unique tokenId
    await instance.createStar(starName, starId, {from: userAlice});
    let ownerOfStarBeforeTransfer = await instance.ownerOf.call(starId);
    assert.equal(ownerOfStarBeforeTransfer, userAlice);
    // 2. Use the transferStar function implemented in the Smart Contract
    await instance.transferStar(userBob, starId, {from: userAlice});
    // 3. Verify that the star owner has changed
    let ownerOfStarAfterTransfer = await instance.ownerOf.call(starId);
    assert.equal(ownerOfStarAfterTransfer, userBob);
});

it('gets the correct star name from lookUpTokenIdToStarInfo', async() => {
    let instance = await StarNotary.deployed();
    let starId = 10;
    let starName = "Betelgeuse";
    let userAlice = accounts[1];
    // 1. Create a Star with a unique tokenId
    await instance.createStar(starName, starId, {from: userAlice});
    // 2. Call your method lookUpTokenIdToStarInfo
    let actualStarName = await instance.lookUpTokenIdToStarInfo.call(starId);
    // 3. Verify that your Star name is the one specified
    assert.equal(actualStarName, starName);
});
