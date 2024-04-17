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

  function addUser(address userAddress, int64[] calldata initialMatrix) public {
    // get the total length of current activity matrix
    uint256 latestIndex = userActivityMatrix.length;

    // append the new user details
    userActivityMatrix.push(initialMatrix);

    // add user id to address mapping
    addressToId[userAddress] = latestIndex;
  }

  function addAnalytics(address payable userAddress, uint256 category, int64 score) public payable {
    userActivityMatrix[addressToId[userAddress]][category] += score;

    // rewarding the users for sharing data
    userAddress.transfer(10000000000);

    // increasing credit limit for provider
    consumerCredits[msg.sender] += 1;

    emit NewAnalytics(userAddress, msg.sender, category);
  }

  receive() external payable {}
}