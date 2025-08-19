// Main application logic for the decentralized blog

// Global variables
let web3;
let blogContract;
let currentAccount = null;
let currentPostIdForTip = null;

// Initialize the application
window.addEventListener('DOMContentLoaded', async () => {
    await initWeb3();
    initContract();
    initEventListeners();
    setupPageNavigation();
    setupScrollToTopButton();
    
    // Load posts without requiring wallet connection
    loadPosts();
});

// Show toast notification
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `alert alert-${type} alert-dismissible fade show alert-toast ${type}`;
    toast.role = 'alert';
    toast.innerHTML = `
        <div class="d-flex align-items-center">
            <i class="fas ${getIconForType(type)} me-2"></i>
            <div>${message}</div>
        </div>
    `;
    
    document.body.appendChild(toast);
    
    // Remove toast after animation
    setTimeout(() => {
        toast.remove();
    }, 3500);
}

// Get icon for toast type
function getIconForType(type) {
    switch(type) {
        case 'success': return 'fa-check-circle';
        case 'error': return 'fa-exclamation-circle';
        case 'warning': return 'fa-exclamation-triangle';
        default: return 'fa-info-circle';
    }
}

// Setup scroll to top button
function setupScrollToTopButton() {
    const scrollToTopBtn = document.getElementById('scrollToTopBtn');
    
    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 300) {
            scrollToTopBtn.style.display = 'flex';
        } else {
            scrollToTopBtn.style.display = 'none';
        }
    });
    
    scrollToTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// Setup page navigation
function setupPageNavigation() {
    // Home link
    document.getElementById('homeLink').addEventListener('click', function(e) {
        e.preventDefault();
        showPage('homePage');
        setActiveNavLink(this);
    });
    
    // Posts link
    document.getElementById('postsLink').addEventListener('click', function(e) {
        e.preventDefault();
        showPage('postsPage');
        setActiveNavLink(this);
        loadPosts();
    });
    
    // Add Post link
    document.getElementById('addPostLink').addEventListener('click', function(e) {
        e.preventDefault();
        showPage('addPostPage');
        setActiveNavLink(this);
    });
    
    // Explore Posts button
    document.getElementById('explorePostsBtn').addEventListener('click', function(e) {
        e.preventDefault();
        showPage('postsPage');
        setActiveNavLink(document.getElementById('postsLink'));
        loadPosts();
    });
    
    // Create Post button
    document.getElementById('createPostBtn').addEventListener('click', function(e) {
        e.preventDefault();
        showPage('addPostPage');
        setActiveNavLink(document.getElementById('addPostLink'));
    });
}

// Show specific page and hide others
function showPage(pageId) {
    document.querySelectorAll('.page-content').forEach(page => {
        page.classList.remove('active');
    });
    document.getElementById(pageId).classList.add('active');
}

// Set active nav link
function setActiveNavLink(activeLink) {
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    activeLink.classList.add('active');
}

// Initialize Web3
async function initWeb3() {
    if (window.ethereum) {
        web3 = new Web3(window.ethereum);
    } else if (window.web3) {
        web3 = new Web3(window.web3.currentProvider);
    } else {
        console.log('Non-Ethereum browser detected. You should consider trying MetaMask!');
    }
}

// Initialize contract
function initContract() {
    if (web3) {
        blogContract = new web3.eth.Contract(config.contractABI, config.contractAddress);
    }
}

// Initialize event listeners
function initEventListeners() {
    // Connect wallet button
    document.getElementById('connectWalletBtn').addEventListener('click', connectWallet);
    
    // Disconnect wallet button
    document.getElementById('disconnectWalletBtn').addEventListener('click', disconnectWallet);
    
    // Create post form
    document.getElementById('createPostForm').addEventListener('submit', createPost);
    
    // Confirm tip button
    document.getElementById('confirmTipBtn').addEventListener('click', confirmTip);
    
    // Image preview
    document.getElementById('postImage').addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        const previewContainer = document.getElementById('imagePreviewContainer');
        const preview = document.getElementById('imagePreview');
        
        const reader = new FileReader();
        reader.onload = function(e) {
            preview.src = e.target.result;
            previewContainer.style.display = 'flex';
        }
        reader.readAsDataURL(file);
    });
    
    // Remove image button
    document.getElementById('removeImageBtn').addEventListener('click', function() {
        document.getElementById('postImage').value = '';
        document.getElementById('imagePreviewContainer').style.display = 'none';
    });
    
    // Listen for account changes
    if (window.ethereum) {
        window.ethereum.on('accountsChanged', (accounts) => {
            if (accounts.length === 0) {
                // Wallet disconnected
                disconnectWallet();
            } else {
                // Account changed
                currentAccount = accounts[0];
                updateWalletInfo();
                loadPosts();
            }
        });
        
        // Listen for chain changes
        window.ethereum.on('chainChanged', () => {
            window.location.reload();
        });
    }
}

// Connect wallet
async function connectWallet() {
    try {
        if (!window.ethereum) {
            showToast('Please install MetaMask to connect your wallet', 'warning');
            return;
        }
        
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        currentAccount = accounts[0];
        
        updateWalletInfo();
        
        // Show wallet info, hide connect button
        document.getElementById('walletInfo').style.display = 'block';
        document.getElementById('connectWalletBtn').style.display = 'none';
        
        showToast('Wallet connected successfully', 'success');
        console.log('Connected:', currentAccount);
    } catch (error) {
        console.error('Error connecting wallet:', error);
        
        if (error.code === 4001) {
            showToast('Wallet connection rejected', 'error');
        } else {
            showToast('Error connecting wallet. Please try again.', 'error');
        }
    }
}

// Disconnect wallet
function disconnectWallet() {
    currentAccount = null;
    
    // Hide wallet info, show connect button
    document.getElementById('walletInfo').style.display = 'none';
    document.getElementById('connectWalletBtn').style.display = 'block';
    
    showToast('Wallet disconnected', 'info');
    console.log('Wallet disconnected');
}

// Update wallet info display
async function updateWalletInfo() {
    if (!currentAccount) return;
    
    document.getElementById('walletAddress').textContent = currentAccount;
    
    // Get balance
    try {
        const balanceWei = await web3.eth.getBalance(currentAccount);
        const balanceEth = web3.utils.fromWei(balanceWei, 'ether');
        document.getElementById('walletBalance').textContent = parseFloat(balanceEth).toFixed(4);
    } catch (error) {
        console.error('Error fetching balance:', error);
    }
}

// Load posts from blockchain
async function loadPosts() {
    const postsContainer = document.getElementById('postsContainer');
    const loadingSpinner = document.getElementById('loadingSpinner');
    
    postsContainer.innerHTML = '';
    loadingSpinner.style.display = 'block';
    
    try {
        if (!blogContract) {
            throw new Error("Blockchain connection not available");
        }
        
        const posts = await blogContract.methods.getAllPosts().call();
        
        if (posts.length === 0) {
            postsContainer.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-newspaper"></i>
                    <h4>No posts yet</h4>
                    <p>Be the first to create a post and share your thoughts with the community!</p>
                    ${currentAccount ? 
                        `<button class="btn btn-primary" id="createFirstPostBtn">
                            <i class="fas fa-plus me-2"></i>Create Your First Post
                        </button>` : 
                        `<button class="btn btn-primary" id="connectToCreateBtn">
                            <i class="fas fa-wallet me-2"></i>Connect Wallet to Create Post
                        </button>`
                    }
                </div>
            `;
            
            if (currentAccount) {
                document.getElementById('createFirstPostBtn').addEventListener('click', () => {
                    showPage('addPostPage');
                    setActiveNavLink(document.getElementById('addPostLink'));
                });
            } else {
                document.getElementById('connectToCreateBtn').addEventListener('click', connectWallet);
            }
        } else {
            // Create a copy of the array and sort it (newest first)
            const sortedPosts = [...posts].sort((a, b) => b.timestamp - a.timestamp);
            
            sortedPosts.forEach(post => {
                const postElement = createPostElement(post);
                postsContainer.appendChild(postElement);
            });
        }
    } catch (error) {
        console.error('Error loading posts:', error);
        postsContainer.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-exclamation-triangle text-warning"></i>
                <h4>Error Loading Posts</h4>
                <p>We couldn't load posts from the blockchain. Please try again later.</p>
                <button class="btn btn-primary" id="retryLoadPostsBtn">
                    <i class="fas fa-sync me-2"></i>Try Again
                </button>
            </div>
        `;
        
        document.getElementById('retryLoadPostsBtn').addEventListener('click', loadPosts);
    } finally {
        loadingSpinner.style.display = 'none';
    }
}

// Create HTML element for a post
function createPostElement(post) {
    const postElement = document.createElement('div');
    postElement.className = 'card mb-4';
    
    const date = new Date(post.timestamp * 1000);
    const formattedDate = date.toLocaleString();
    
    // Format the tip amount in ETH
    const tipAmountEth = web3.utils.fromWei(post.tipAmount.toString(), 'ether');
    
    // Add image if available
    const imageHtml = post.imageHash 
        ? `<div class="card-img-top-container">
              <img src="https://gateway.pinata.cloud/ipfs/${post.imageHash}" 
                   alt="${post.title}" 
                   class="card-img-top">
           </div>`
        : '';
    
    // Check if current user is the author
    const isAuthor = currentAccount && currentAccount.toLowerCase() === post.author.toLowerCase();
    
    postElement.innerHTML = `
        ${imageHtml}
        <div class="card-header">
            <h5>${post.title}</h5>
            <span class="author-badge">
                <i class="fas fa-user"></i>${formatAddress(post.author)}
                ${isAuthor ? '<span class="badge bg-secondary ms-2">You</span>' : ''}
            </span>
        </div>
        <div class="card-body">
            <div class="post-content">${formatContent(post.content)}</div>
            <div class="d-flex justify-content-between align-items-center mt-4">
                <div class="d-flex align-items-center gap-3">
                    <span class="timestamp">
                        <i class="far fa-clock"></i>${formattedDate}
                    </span>
                    <span class="tip-amount">
                        <i class="fas fa-coins"></i>${parseFloat(tipAmountEth).toFixed(4)} ETH
                    </span>
                </div>
                ${!isAuthor ? 
                    `<button class="tip-btn" data-post-id="${post.id}">
                        <i class="fas fa-gift"></i> Tip Author
                    </button>` : 
                    `<span class="badge bg-light text-dark">
                        <i class="fas fa-user-edit me-1"></i>Your Post
                    </span>`
                }
            </div>
        </div>
    `;
    
    // Add event listener to tip button if not the author
    if (!isAuthor) {
        const tipBtn = postElement.querySelector('.tip-btn');
        tipBtn.addEventListener('click', () => {
            if (!currentAccount) {
                showToast('Please connect your wallet to send a tip', 'warning');
                return;
            }
            
            currentPostIdForTip = post.id;
            const tipModal = new bootstrap.Modal(document.getElementById('tipModal'));
            tipModal.show();
        });
    }
    
    return postElement;
}

// Format address to show first and last 4 characters
function formatAddress(address) {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
}

// Format content with line breaks
function formatContent(content) {
    if (!content) return '';
    return content.replace(/\n/g, '<br>');
}

// Upload image to IPFS via Pinata
async function uploadImageToIPFS(file) {
    const formData = new FormData();
    formData.append('file', file);
    
    const metadata = JSON.stringify({
        name: file.name,
    });
    formData.append('pinataMetadata', metadata);
    
    const options = JSON.stringify({
        cidVersion: 0
    });
    formData.append('pinataOptions', options);

    try {
        const progressBar = document.getElementById('imageUploadProgress');
        progressBar.style.display = 'block';
        
        const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${config.PINATA_JWT}`
            },
            body: formData,
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        return data.IpfsHash;
    } catch (error) {
        console.error('Error uploading image to IPFS:', error);
        throw error;
    } finally {
        document.getElementById('imageUploadProgress').style.display = 'none';
    }
}

// Create a new post
async function createPost(e) {
    e.preventDefault();
    
    if (!currentAccount) {
        showToast('Please connect your wallet first', 'warning');
        return;
    }
    
    const title = document.getElementById('postTitle').value;
    const content = document.getElementById('postContent').value;
    const imageFile = document.getElementById('postImage').files[0];
    
    if (!title || !content) {
        showToast('Please fill in all required fields', 'warning');
        return;
    }
    
    try {
        let imageHash = '';
        
        // Upload image if provided
        if (imageFile) {
            try {
                showToast('Uploading image to IPFS...', 'info');
                imageHash = await uploadImageToIPFS(imageFile);
                showToast('Image uploaded successfully', 'success');
            } catch (error) {
                console.error('Error uploading image:', error);
                showToast('Error uploading image. Post will be created without image.', 'warning');
            }
        }
        
        showToast('Creating post on blockchain...', 'info');
        
        await blogContract.methods.createPost(title, content, imageHash)
            .send({ from: currentAccount });
        
        // Clear form
        document.getElementById('createPostForm').reset();
        document.getElementById('imagePreviewContainer').style.display = 'none';
        
        // Reload posts
        loadPosts();
        
        // Return to posts page
        showPage('postsPage');
        setActiveNavLink(document.getElementById('postsLink'));
        
        showToast('Post created successfully!', 'success');
    } catch (error) {
        console.error('Error creating post:', error);
        
        if (error.code === 4001) {
            showToast('Post creation rejected', 'error');
        } else {
            showToast('Error creating post. Please try again.', 'error');
        }
    }
}

// Confirm tip and send transaction
async function confirmTip() {
    if (!currentAccount || !currentPostIdForTip) return;
    
    const tipAmountEth = document.getElementById('tipAmount').value;
    const tipAmountWei = web3.utils.toWei(tipAmountEth, 'ether');
    
    const tipModal = bootstrap.Modal.getInstance(document.getElementById('tipModal'));
    
    try {
        showToast('Sending tip...', 'info');
        
        await blogContract.methods.tipPost(currentPostIdForTip)
            .send({ 
                from: currentAccount, 
                value: tipAmountWei 
            });
        
        tipModal.hide();
        loadPosts();
        updateWalletInfo();
        
        showToast('Tip sent successfully!', 'success');
    } catch (error) {
        console.error('Error sending tip:', error);
        
        if (error.code === 4001) {
            showToast('Tip transaction rejected', 'error');
        } else {
            showToast('Error sending tip. Please try again.', 'error');
        }
    }
}