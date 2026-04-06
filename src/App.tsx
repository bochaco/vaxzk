import { useState } from 'react';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import './index.css';

function App() {
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);

  const handleLoginSuccess = (address: string) => {
    setWalletAddress(address);
    setIsConnected(true);
  };

  const handleLogout = () => {
    setIsConnected(false);
    setWalletAddress(null);
  };

  return (
    <>
      {isConnected ? (
        <Dashboard onLogout={handleLogout} walletAddress={walletAddress} />
      ) : (
        <Login onLoginSuccess={handleLoginSuccess} />
      )}
    </>
  );
}

export default App;
