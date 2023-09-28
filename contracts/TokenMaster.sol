// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.21;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract TokenMaster is ERC721 {
    address public owner;
    uint256 public totalOccasions; //total number of events or shows
    uint256 public totalSupply; //total number of tickets available

    struct Occasion {
        uint256 id;
        string name;
        uint256 cost;
        uint256 tickets;
        uint256 maxTickets;
        string date;
        string time;
        string location;
    }

    mapping(uint256 => Occasion) occasions;
    mapping(uint256 => mapping(address => bool)) public hasBought;

    mapping(uint256 occasionID => mapping(uint256 seatID => address ownerOfSeat)) public seatTaken;
    mapping(uint256 => uint256[]) seatsTaken;

    modifier onlyOwner() {
        require(owner == msg.sender);
        _;
    }

    constructor(string memory _name, string memory _symbol) ERC721 (_name, _symbol) {
        owner = msg.sender;
    }    

    function list(
        string memory _name, 
        uint256 _cost,
        uint256 _maxTickets,
        string memory _date,
        string memory _time,
        string memory _location) 
        public onlyOwner {
            totalOccasions++;
            occasions[totalOccasions] = Occasion(totalOccasions, _name, _cost, _maxTickets, _maxTickets, _date, _time, _location);
    }

    function mint(uint256 _id, uint256 _seat) public payable {
        //Requires that _id is not 0 or less than total occasions
        require(_id != 0);
        require(_id <= totalOccasions);

        //require that ETH sent is greater than cost
        require(msg.value >= occasions[_id].cost);

        //require that the seat is not taken, & the seat exists
        require(seatTaken[_id][_seat] == address(0));
        require(_seat <= occasions[_id].maxTickets);

        occasions[_id].tickets--; //update available ticket count
        hasBought[_id][msg.sender] = true; //Update buying status

        seatTaken[_id][_seat] = msg.sender; //assign seat
        seatsTaken[_id].push(_seat); //update seats currently taken

        totalSupply++;
        _safeMint(msg.sender, totalSupply);
    }

    function getOccasion(uint256 _id) public view returns(Occasion memory) {
        return occasions[_id];
    }

    function getSeatsTaken(uint256 _id) public view returns(uint256[] memory) {
        return seatsTaken[_id];
    }

    function withdraw() public onlyOwner {
        (bool success, ) = owner.call{value: address(this).balance}("");
        require(success);
    }
}
