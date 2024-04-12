//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

contract UserAnalytics {
  int64[][] public userActivityMatrix;
  mapping(address => uint256) public addressToId;
  mapping(address => uint256) public consumerCredits;
  string public currentStylusRPC;

  event NewAnalytics(
    address user,
    address provider,
    uint256 category
  );

  function addAnalytics(address payable userAddress, uint256 category, int64 score) public payable {
    userActivityMatrix[addressToId[userAddress]][category] += score;

    // rewarding the users for sharing data
    userAddress.transfer(10000000000);

    // increasing credit limit for provider
    consumerCredits[msg.sender] += 1;

    emit NewAnalytics(userAddress, msg.sender, category);
  }

  function fetchRecommendations() public view {
    require(consumerCredits[msg.sender] > 10);
  }

  receive() external payable {}
}