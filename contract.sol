// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Blog {
    struct Post {
        uint256 id;
        address author;
        string title;
        string content;
        string imageHash;
        uint256 timestamp;
        uint256 tipAmount;
    }

    uint256 public postCount = 0;
    mapping(uint256 => Post) public posts;
    
    event PostCreated(
        uint256 id,
        address author,
        string title,
        string content,
        string imageHash,
        uint256 timestamp
    );
    
    event PostTipped(
        uint256 id,
        address tipper,
        address author,
        uint256 amount,
        uint256 timestamp
    );

    function createPost(string memory _title, string memory _content, string memory _imageHash) public {
        postCount++;
        posts[postCount] = Post(
            postCount,
            msg.sender,
            _title,
            _content,
            _imageHash,
            block.timestamp,
            0
        );
        
        emit PostCreated(
            postCount,
            msg.sender,
            _title,
            _content,
            _imageHash,
            block.timestamp
        );
    }

    function tipPost(uint256 _id) public payable {
        require(_id > 0 && _id <= postCount, "Invalid post ID");
        require(msg.value > 0, "Tip amount must be greater than 0");
        
        Post storage post = posts[_id];
        post.tipAmount += msg.value;
        
        (bool sent, ) = post.author.call{value: msg.value}("");
        require(sent, "Failed to send Ether");
        
        emit PostTipped(
            _id,
            msg.sender,
            post.author,
            msg.value,
            block.timestamp
        );
    }

    function getAllPosts() public view returns (Post[] memory) {
        Post[] memory allPosts = new Post[](postCount);
        for (uint256 i = 1; i <= postCount; i++) {
            allPosts[i - 1] = posts[i];
        }
        return allPosts;
    }
}