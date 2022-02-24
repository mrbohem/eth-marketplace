// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Marketplace{
     uint public productCount = 0;
     mapping(uint => Product) public products;
     struct Product {
          uint id;
          string name;
          uint price;
          address payable owner;
          bool isPurchased;
     }

     event ProductCreated(uint id,string name,uint price, address payable owner, bool isPurchased);
     event ProductPurchased(uint id,string name,uint price, address payable owner, bool isPurchased);

     function createProduct(string memory _name,uint _price) public{
          // validate product details
          require(bytes(_name).length > 0,'please enter valid product name');
          require(_price > 0,'please enter valid product price');

          productCount++;
          products[productCount] = Product(productCount,_name,_price,payable(msg.sender),false);
          emit ProductCreated(productCount, _name, _price, payable(msg.sender), false);
     }

     function purchaseProduct(uint _id) public payable{
          Product memory _product = products[_id];
          address payable _seller = _product.owner;

          // validate request
          require(_product.id > 0 && _product.id <= productCount );
          require(msg.value >= _product.price);
          require(!_product.isPurchased);
          require(_product.owner != msg.sender);
          

          _product.owner = payable(msg.sender);
          _product.isPurchased = true;
          products[_id] = _product;
          payable(_seller).transfer(_product.price);
          emit ProductPurchased(productCount, _product.name, _product.price, _product.owner, true);
     }
}
