import { useEffect, useState } from "react";
import { Container } from "react-bootstrap";
import { ethers } from "ethers";

// Components
import Navigation from "./Navigation";
import Loading from "./Loading";

// ABIs: Import your contract ABIs here
import NFT_ABI from "../abis/NFT.json";

// Config: Import your network config here
import config from "../config.json";

function App() {
  const [provider, setProvider] = useState(null);
  const [nft, setNft] = useState(null);

  const [account, setAccount] = useState(null);

  const [isLoading, setIsLoading] = useState(true);

  const loadBlockchainData = async () => {
    // Initiate provider
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    setProvider(provider);

    const nft = new ethers.Contract(
      config[31337].nft.address,
      NFT_ABI,
      provider
    );
    setNft(nft);

    // Fetch accounts
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });
    const account = ethers.utils.getAddress(accounts[0]);
    setAccount(account);

    setIsLoading(false);
  };

  useEffect(() => {
    if (isLoading) {
      loadBlockchainData();
    }
  }, [isLoading]);

  return (
    <Container>
      <Navigation account={account} />

      <h1 className="my-4 text-center">Dapp Punks</h1>

      {isLoading ? (
        <Loading />
      ) : (
        <>
          <p className="text-center">
           
          </p>
          <p className="text-center">Edit App.js to add your code here.</p>
        </>
      )}
    </Container>
  );
}

export default App;
