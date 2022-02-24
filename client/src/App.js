import React, { Component, useEffect, useState } from "react";
import getWeb3 from "./getWeb3";
import "./App.css";
import Marketplace from './contracts/Marketplace.json';

function App() {
  let web3
  let networkId
  let networkData
  let marketplace
  const [productName, setProductName] = useState('');
  const [productPrice, setProductPrice] = useState();
  const [account, setAccount] = useState();
  const [contract, setContract] = useState({});
  const [product, setProduct] = useState([]);
  // const [window.web3, setWeb3] = useState();

  const createProduct = async () => {
    if (productName && productPrice) {
      let price = window.web3.utils.toWei(productPrice, 'Ether')
      let productData = await contract.marketplace.methods.createProduct(productName, price).send({ from: account });
      // loadWeb3();
      await loadProducts(networkData, contract.marketplace);
    }
  }

  const purchaseProduct = async (productId, price) => {
    // price = window.window.web3.utils.toWei(price, 'Ether')
    price = window.web3.utils.toWei(price, 'Ether')

    contract.marketplace.methods
      .purchaseProduct(productId)
      .send({ from: account, value: price, gas: 500000 })
      .on('receipt', (receipt) => loadProducts(networkData, contract.marketplace)  )
  }

  const loadWeb3 = async () => {
    window.web3 = await getWeb3();
  }

  // const getProducts = async() => {

  // }

  const loadBlockchainData = async () => {
    window.web3 = await getWeb3();
    networkId = await window.web3.eth.net.getId()
    networkData = Marketplace.networks[networkId]
    if (networkData) {
      const marketplace = new window.web3.eth.Contract(Marketplace.abi, networkData.address)
      await loadProducts(networkData, marketplace);
    } else {
      window.alert('Marketplace contract not deployed to detected network.')
    }
  }

  const loadProducts = async (networkData, marketplace) => {
    const productCount = await marketplace.methods.productCount().call()
    setContract({ marketplace: marketplace, productCount: productCount, loading: false })

    setProduct(() => [])
    for (var i = 1; i <= productCount; i++) {
      let productTemp = await marketplace.methods.products(i).call()
      productTemp = { ...productTemp, price: window.web3.utils.fromWei(productTemp.price, 'ether')}
      setProduct(prevState => ([...prevState, productTemp]));
    }
    setProductName('')
    setProductPrice(0)
  }


  const getAccount = async () => {
    const accounts = await window.web3.eth.getAccounts()
    setAccount(accounts[0])
  }

  useEffect(async () => {
    // await loadWeb3();
    await loadBlockchainData();
    await getAccount();
  }, []);

  return (
    <div className="App">
      <div className="bg-blue-300 text-center h-10 leading-5 flex justify-center items-center text-white">
        {account}
      </div>
      <div className="flex flex-wrap justify-center mt-6">
        <div className="w-full">
          <div className="flex justify-center">
            <form className="flex justify-center bg-gray-200 p-12 w-2/3">
              <div className="mx-10 flex flex-col">
                <label htmlFor="" className="text-gray-700 font-bold" >Product Name</label>
                <input type="text" className="shadow " onChange={(e) => setProductName(e.target.value)} value={productName}/>
              </div>
                <div className="mx-10 flex flex-col">

                <label htmlFor="" className="text-gray-700 font-bold" >Product Price (Ether)</label>
                <input type="number" className="shadow " onChange={(e) => setProductPrice(e.target.value)} value={productPrice}/>
              </div>
              <div className="flex  items-end">

                <button type="button" className="rounded-lg bg-green-500 p-2 hover:bg-green-600" onClick={createProduct}>Save</button>
              </div>
            </form>
          </div>


          <div>
            <table class="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 text-center">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price (Ether)</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Owner</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
              {product.map((item, index) => {
                return (
                  <tr key={index.toString()} className="shadow-lg rounded-lg py-5" >
                    <td className="px-6 py-4 whitespace-nowrap">{item.name} </td>
                    <td>{item.price}</td>
                    <td className="">{item.owner}</td>
                    <td>
                      {item.isPurchased
                        ? (<span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800"> Sold </span>)
                        : (<button type="button" className="bg-red-200 rounded-full shadow-md p-2" onClick={() => purchaseProduct(parseInt(item.id), item.price)}>Buy Now</button>)}
                    </td>
                  </tr>
                )
              })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
export default App;