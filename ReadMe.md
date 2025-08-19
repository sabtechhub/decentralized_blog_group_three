# Decentralized Blog Platform  

---

## 📖 1.0 Overview of the System
This decentralized blog platform is a **blockchain-powered application** that allows users to create, share, and monetize content directly on the **Ethereum blockchain**.  

The platform leverages:  
- **Smart Contracts** for content storage and transactions  
- **IPFS** for decentralized image storage  
- **Web3.js** for blockchain interaction  

---

## ✨ 2.0 Key Features
- **Decentralized Content Storage:** All post images are stored on the Ethereum blockchain  
- **Direct Monetization:** Readers can tip authors in ETH directly through the platform  
- **Censorship-Resistant:** Content cannot be altered or removed by any central authority  
- **IPFS Integration:** Images are stored on IPFS via Pinata for decentralized storage  
- **Wallet Integration:** MetaMask support for secure transactions and identity management  

---

## 🛠️ 3.0 Technology Stack
- **Frontend:** HTML, CSS, JavaScript, Bootstrap  
- **Blockchain:** Ethereum, Solidity smart contracts  
- **Web3:** Web3.js library  
- **Storage:** IPFS via Pinata  
- **UI:** Font Awesome icons, Poppins font  

---

## ⚙️ 4.0 How It Works  

### 🔹 Initialization
- The application initializes Web3 and connects to the Ethereum network  
- The smart contract is instantiated using its ABI and address  
- Event listeners are set up for user interactions  

### 🔹 Core Functionality
**Post Creation**  
1. Users connect their wallet  
2. Fill in post details (title, content, optional image)  
3. Images are uploaded to IPFS  
4. Transaction is sent to the blockchain to create the post  

**Post Viewing**  
- Posts are loaded from the blockchain  
- Displayed in a user-friendly format with author info and timestamps  
- Sorted by newest first  

**Tipping**  
- Readers can send ETH tips to authors  
- Tip amount is specified in ETH  
- Transaction is sent directly to the author's wallet  

---

## 🚀 5.0 Setup Instructions
### Option 1: Manual Setup
1. Create a folder and place the `app.js`, `config.js`, and `index.html` files in it  

### Option 2: Clone the Repository
```bash
git clone https://github.com/sabtechhub/decentralized_blog_group_three.git
cd decentralized_blog_group_three
