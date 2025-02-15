// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";


contract CompanyAggreement {
    uint256 ID = 1;
    address[] validSigners;
    uint256 public Quorum = 3;

    mapping(address => bool) public valid;
    mapping(uint256 => address) beneficiary;
    mapping(uint256 => uint256) amount;
    mapping(uint256 => uint256) public noOfApproval;
    mapping(uint256 => mapping(uint256 => bool)) _approved;
    mapping(address => mapping(uint256 => bool)) signed;

    constructor(address[] memory _validSigners){
        validSigners = _validSigners;
    }


    
    function validOwners() private returns(bool){
        require(msg.sender != address(0));
        address coOwner;
        for(uint i = 0; i < validSigners.length; i++){
            if(validSigners[i] == msg.sender){
                coOwner = msg.sender;
            }
        
        }

        return valid[msg.sender] = true;
    }

    //["0xAb5801A7D398351b8bE11C439e05C5b3259aec9B","0x742d35Cc6634C0532925a3b844Bc454e4438f44e","0x53d284357ec70cE289D6D64134DfAc8E511c8a3D","0x281055afc982d96fab65b3a49cac8b878184cb16","0xfe9e8709d3215310075d67e3ed32a380ccf451c8","0x5a52e96bacdabb82fd05763e25335261b270efcb","0x97de57ec338ab5d51557da3434828c5dbfada371"]

//[0xAb5801A7D398351b8bE11C439e05C5b3259aec9B, 0x742d35Cc6634C0532925a3b844Bc454e4438f44e, 0x53d284357ec70cE289D6D64134DfAc8E511c8a3D, 0x281055afc982d96fab65b3a49cac8b878184cb16, 0xfe9e8709d3215310075d67e3ed32a380ccf451c8]
    //1. amount to be approve
    //2. the beneficiary that is requesting the approval tagged with an id
    //3. signed mapping for the caller of this function to track if signed or not this tracking is done with an id
    //4. track the number of approval and increment the number of approval
    //5. if number of approval meets the quoroum and above, the txn is approve setting it to true
    //6. transfer is been made
    function Approve(uint256 id) public {
        require(validOwners(), "Caller is not a valid owner");
        require(amount[id] > 0, "zero amount");
        require(beneficiary[id] == address(0), "address zero");
        require(!signed[msg.sender][id], "Already signed");

        uint256 amountValue = amount[id];
        address _ben = beneficiary[id];

        signed[msg.sender][id] = true;
        noOfApproval[id] = noOfApproval[id] + 1;

        if (noOfApproval[id] >= validSigners.length) {
            _approved[id][noOfApproval[id]] = true;
            (bool sent, ) = payable(_ben).call{value: amountValue}("");
            require(sent, "Transfer failed");
        }

    }


    function contractBalance() external view returns (uint256) {
        return address(this).balance;
    }

    receive() external payable {}

    fallback() external payable {}


}
