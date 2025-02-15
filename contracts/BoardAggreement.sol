// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";


contract BoardAgreement {
        IERC20 public  token;

    // Error 
    error INAVLID_BOARD_MEMBER();
    error NOT_A_BOARDMEMBER();
    error NOT_UNIQUE_BOARD_MEMBER();
    error ALLBOARD_MUST_CONFIRM();
    error BOARD_MEMBER_REQUIRED();
    error MEMBER_ALREADY_CONFIRM_DECISION();
    error TRANSACTION_NOT_EXIST();
    error TRANSACTION_INDEX_NOT_EXIST();

    event Deposit(address indexed sender, uint256 amount, uint256 balance);
    event SubmitDecision(
        address indexed owner,
        uint256 indexed txIndex,
        address indexed to,
        uint256 value,
        string _propsal
    );

    event ConfirmDecision(address indexed owner, uint256 indexed txIndex);
    event RevokeConfirmation(address indexed owner, uint256 indexed txIndex);
    event ExecuteDecision(address indexed owner, uint256 indexed txIndex);

    address[] public boardMembers;
    mapping(address => bool) public isBoardMember;
    uint256 public numConfirmationsRequired;

    struct Decision {
        address to;
        uint256 value;
        string propsal;
        bool executed;
        uint256 numConfirmations;
    }

    // mapping from tx index => owner => bool
    mapping(uint256 => mapping(address => bool)) public isConfirmed;

    Decision[] public decisions;

    modifier onlyBoardMember() {
        if(!isBoardMember[msg.sender]) revert NOT_A_BOARDMEMBER();
        _;
    }

    modifier txExists(uint256 _txIndex) {
        if(_txIndex > decisions.length) revert TRANSACTION_INDEX_NOT_EXIST();
        _;
    }

    modifier notExecuted(uint256 _txIndex) {
        if(decisions[_txIndex].executed) revert TRANSACTION_NOT_EXIST();
        _;
    }

    modifier notConfirmed(uint256 _txIndex) {
        if(isConfirmed[_txIndex][msg.sender]) revert MEMBER_ALREADY_CONFIRM_DECISION();
        _;
    }

    constructor(address[] memory _boardMembers, address _token) {
        if(_boardMembers.length == 0) revert BOARD_MEMBER_REQUIRED();
       

        for (uint256 i = 0; i < _boardMembers.length; i++) {
            address owner = _boardMembers[i];

            if (owner == address(0)) revert INAVLID_BOARD_MEMBER();
            if(isBoardMember[owner]) revert NOT_UNIQUE_BOARD_MEMBER();

            isBoardMember[owner] = true;
            boardMembers.push(owner);
        }
        token = IERC20(_token);
    }

    

    function submitDecision(address _to, uint256 _value, string memory _propsal)
        public
        onlyBoardMember
    {
        uint256 txIndex = decisions.length;

        decisions.push(
            Decision({
                to: _to,
                value: _value,
                propsal: _propsal,
                executed: false,
                numConfirmations: 0
            })
        );

        emit SubmitDecision(msg.sender, txIndex, _to, _value, _propsal);
    }

    function confirmDecision(uint256 _txIndex)
        public
        onlyBoardMember
        txExists(_txIndex)
        notExecuted(_txIndex)
        notConfirmed(_txIndex)
    {
        Decision storage decision = decisions[_txIndex];
        decision.numConfirmations += 1;
        isConfirmed[_txIndex][msg.sender] = true;

        emit ConfirmDecision(msg.sender, _txIndex);
    }

    function executeDecision(uint256 _txIndex)
        public
        onlyBoardMember
        txExists(_txIndex)
        notExecuted(_txIndex)
    {

        if(_txIndex > decisions.length) revert TRANSACTION_INDEX_NOT_EXIST();

        Decision storage decision = decisions[_txIndex];

        if(decision.numConfirmations != boardMembers.length) revert ALLBOARD_MUST_CONFIRM();

        decision.executed = true;

        token.transfer(decision.to, decision.value);

        emit ExecuteDecision(msg.sender, _txIndex);
    }

    function revokeConfirmation(uint256 _txIndex)
        public
        onlyBoardMember
        txExists(_txIndex)
        notExecuted(_txIndex)
    {
        Decision storage decision = decisions[_txIndex];

        require(isConfirmed[_txIndex][msg.sender], "tx not confirmed");

        decision.numConfirmations -= 1;
        isConfirmed[_txIndex][msg.sender] = false;

        emit RevokeConfirmation(msg.sender, _txIndex);
    }

    function getboardMembers() public view returns (address[] memory) {
        return boardMembers;
    }

    function getDecisionCount() public view returns (uint256) {
        return decisions.length;
    }

    function getDecision(uint256 _txIndex)
        public
        view
        returns (
            address to,
            uint256 value,
            string memory propsal,
            bool executed,
            uint256 numConfirmations
        )
    {
        Decision storage decision = decisions[_txIndex];

        return (
            decision.to,
            decision.value,
            decision.propsal,
            decision.executed,
            decision.numConfirmations
        );
    }
}
