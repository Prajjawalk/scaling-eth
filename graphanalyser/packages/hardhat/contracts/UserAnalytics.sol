//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

contract UserAnalytics {
  int64[][] public userActivityMatrix;
  mapping(address => uint256) public addressToId;
  mapping(uint256 => address) public idToAddress;
  mapping(address => uint256) public consumerCredits;
  string public currentStylusRPC;
  uint256 latestIndex;
  uint256 totalCategories;

  constructor() {
    int64[] memory initialMatrix;
    userActivityMatrix.push(initialMatrix);
    latestIndex = 1;
    totalCategories = 5;
  }

  event NewAnalytics(
    address user,
    address provider,
    uint256 category
  );

  function addUser(address userAddress) public {
    // get the total length of current activity matrix
    latestIndex += 1;

      // add the new user details
      for(uint256 i = 0; i < totalCategories; i++ ) {
        userActivityMatrix[latestIndex][i] = 0;
      }
      

      // add user id to address mapping
      addressToId[userAddress] = latestIndex;
      idToAddress[latestIndex] = userAddress;
  }

  function addAnalytics(address payable userAddress, uint256 category, int64 score) public payable {
    // add user if not already present
    if (addressToId[userAddress] == 0) {
     
      latestIndex += 1;

      // add the new user details
      for(uint256 i = 0; i < totalCategories; i++ ) {
        userActivityMatrix[latestIndex][i] = 0;
      }
      

      // add user id to address mapping
      addressToId[userAddress] = latestIndex;
      idToAddress[latestIndex] = userAddress;
    }

    userActivityMatrix[addressToId[userAddress]][category] += score;

    // // rewarding the users for sharing data
    bool sent = userAddress.send(100);
    require(sent, "Failed to reward user");

    // // increasing credit limit for provider
    consumerCredits[msg.sender] = consumerCredits[msg.sender] + 1;

    emit NewAnalytics(userAddress, msg.sender, category);
  }

  function getUserActivityMatrix() external view returns(int64[][] memory) {
    return userActivityMatrix;
  }

  receive() external payable {}
}