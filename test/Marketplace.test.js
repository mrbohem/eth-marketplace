
const Marketplace = artifacts.require('./Marketplace.sol');

require('chai')
     .use(require('chai-as-promised'))
     .should()

contract('Marketplace', ([deployer,seller,buyer]) => {
     let marketplace
     let price = web3.utils.toWei('1', 'Ether')

     before(async () => {
          marketplace = await Marketplace.deployed()
     });

     describe('deployment', async () => {
          it('deploys successfully', async () => {
               const address = await marketplace.address;
               assert.notEqual(address, 0x0)
               assert.notEqual(address, '')
               assert.notEqual(address, null)
               assert.notEqual(address, undefined)
          })
     });

     describe('products', async () => {
          let result, productCount
          before(async () => {
               result = await marketplace.createProduct('first', price, { from: seller })
               productCount = await marketplace.productCount()
          })
          it('crate products', async () => {
               assert.equal(productCount, 1)
               const event = result.logs[0].args;
               assert.equal(event.id.toNumber(), productCount.toNumber())
               assert.equal(event.name, 'first')
               assert.equal(event.price, price)
               assert.equal(event.owner,seller)
               assert.equal(event.isPurchased, false)

               await marketplace.createProduct('', price, { from: seller }).should.be.rejected
          })

          it('purchase product', async () => {

               let sellerOldBalance 
               sellerOldBalance = await web3.eth.getBalance(seller)
               sellerOldBalance = new web3.utils.BN(sellerOldBalance)

               result = await marketplace.purchaseProduct(productCount, { from: buyer, value: price});
               const event = result.logs[0].args;
               
               assert.equal(event.id.toNumber(), productCount.toNumber())
               assert.equal(event.name, 'first')
               assert.equal(event.price, price)
               assert.equal(event.owner, buyer)
               assert.equal(event.isPurchased, true)

               let sellerNewBalance
               sellerNewBalance = await web3.eth.getBalance(seller)
               sellerNewBalance = new web3.utils.BN(sellerNewBalance)

               const expectedBalance = sellerOldBalance.add(new web3.utils.BN(price))
               assert.equal(sellerNewBalance.toString(), expectedBalance.toString())
               
               await marketplace.purchaseProduct(99, { from: buyer, value: price }).should.be.rejected
               await marketplace.purchaseProduct(productCount, { from: deployer, value: price / 2 }).should.be.rejected
               await marketplace.purchaseProduct(productCount, { from: buyer, value: price / 2 }).should.be.rejected
          })
     })
})