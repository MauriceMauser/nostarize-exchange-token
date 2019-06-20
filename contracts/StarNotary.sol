// Udacity Blockchain Developer Nanodegree
pragma solidity >=0.4.24;

// ERC-721 Non-Fungible Token
import "../node_modules/openzeppelin-solidity/contracts/token/ERC721/ERC721.sol";

contract StarNotary is ERC721 {

    struct Star {
        string name;
    }

    // I.1 Add name and symbol
    string public name;
    string public symbol;

    mapping(uint256 => Star) public tokenIdToStarInfo;
    mapping(uint256 => uint256) public starsForSale;

    constructor() public {
        name = "Nostarize Exchange Token";
        symbol = "NOSEXT";
    }

    function createStar(string memory _name, uint256 _tokenId) public {
        Star memory newStar = Star(_name);
        tokenIdToStarInfo[_tokenId] = newStar; // map id -> Star
        _mint(msg.sender, _tokenId); // allocate star to initial owner (sender address)
    }

    function putStarUpForSale(uint256 _tokenId, uint256 _price) public {
        require(ownerOf(_tokenId) == msg.sender, "Only the star's owner is permitted to sell it.");
        starsForSale[_tokenId] = _price;
    }


    // Helper function to convert a non-payable into a payable address
    function _make_payable(address x) internal pure returns (address payable) {
        return address(uint160(x));
    }

    function buyStar(uint256 _tokenId) public  payable {
        require(starsForSale[_tokenId] > 0, "Star is not for sale.");
        uint256 starCost = starsForSale[_tokenId];
        address ownerAddress = ownerOf(_tokenId);
        require(msg.value > starCost, "Not enough Ether.");
        _transferFrom(ownerAddress, msg.sender, _tokenId);
        address payable ownerAddressPayable = _make_payable(ownerAddress); // convert to payable address
        ownerAddressPayable.transfer(starCost);
        if(msg.value > starCost) {
            msg.sender.transfer(msg.value - starCost); // send back change
        }
    }

    // I.2 Lookup a Star's name by ID
    function lookUpTokenIdToStarInfo (uint _tokenId) public view returns (string memory) {
        return tokenIdToStarInfo[_tokenId].name;
    }

    // I.3 Exchange one user's Star for another's
    function exchangeStars(uint256 _tokenId1, uint256 _tokenId2) public {
        // Token owners
        address ownerOf1 = ownerOf(_tokenId1);
        address ownerOf2 = ownerOf(_tokenId2);
        // Ensure the exchange is initiated by one of the stars' owners
        bool senderIsOwnerOf1 = msg.sender == ownerOf1;
        bool senderIsOwnerOf2 = msg.sender == ownerOf2;
        require((senderIsOwnerOf1 || senderIsOwnerOf2), "Only a star's owner is permitted to exchange it for another.");
        // Exchange tokens
        _transferFrom(ownerOf1, ownerOf2, _tokenId1);
        _transferFrom(ownerOf2, ownerOf1, _tokenId2);
    }

    // I.4 Transfer Star from caller's address
    function transferStar(address _to, uint256 _tokenId) public {
        require(msg.sender == ownerOf(_tokenId), "Only the star's owner is permitted to transfer it.");
        _transferFrom(msg.sender, _to, _tokenId);
    }
}
