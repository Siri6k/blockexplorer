import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";
import {
  Navbar,
  Container,
  Form,
  Button,
  Row,
  Col,
  Tab,
  Tabs,
  Spinner,
  Alert,
  Badge,
  Nav,
  ThemeProvider,
  ToggleButton,
} from "react-bootstrap";
import { MoonStarsFill, SunFill } from "react-bootstrap-icons";
import "./App.css";
// Bootstrap CSS
import "bootstrap/dist/css/bootstrap.min.css";

// Components
import BlockCard from "./components/BlockCard";
import TransactionCard from "./components/TransactionCard";
import AddressPage from "./pages/AddressPage";
import TransactionPage from "./pages/TransactionPage.js";
import BlockPage from "./pages/BlockPage";

import alchemy from "./utils/settings";
import { ethers } from "ethers";

function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [networkStats, setNetworkStats] = useState({
    gasPrice: 0,
    blockNumber: 0,
    network: "Mainnet",
  });
  const provider = alchemy.core;
  async function fetchNetworkStats() {
    setLoading(true);
    setError(null);
    try {
      const blockNumber = await provider.getBlockNumber();
      const feeData = await provider.getFeeData();
      const gasPrice = feeData.gasPrice;
      // Already a BigNumber, no need for parseUnits
      const intValue = gasPrice.toString(); // Convert to string representation

      // Convert to Gwei
      const gasPriceInGwei = ethers.formatUnits(intValue, "gwei");
      const gasPriceInFloat = parseFloat(gasPriceInGwei).toFixed(2);

      setNetworkStats({
        gasPrice: gasPriceInFloat,
        blockNumber: blockNumber,
        network: "Mainnet",
      });
      setLoading(false);
      setError(null);
    } catch (error) {
      console.error("Error fetching network stats:", error);
      setError("Failed to fetch network stats. Please try again.");
      setLoading(false);
      setNetworkStats({
        gasPrice: 0,
        blockNumber: 0,
        network: "Mainnet",
      });
    }
  }
  useEffect(() => {
    fetchNetworkStats();
  }, []);

  return (
    <ThemeProvider data-bs-theme={darkMode ? "dark" : "light"}>
      <Router>
        <div className={darkMode ? "bg-dark text-white" : "bg-light"}>
          {/* Navbar */}
          <Navbar expand="lg" className="border-bottom">
            <Container>
              <Navbar.Brand as={Link} to="/" className="fw-bold">
                <span style={{ color: "#7b3fe4" }}>EtherScan by Niplan</span>{" "}
                Clone
              </Navbar.Brand>
              <SearchBar />
              <ToggleButton
                type="checkbox"
                variant="outline-secondary"
                checked={darkMode}
                onClick={() => setDarkMode(!darkMode)}
                className="ms-2"
              >
                {darkMode ? <SunFill /> : <MoonStarsFill />}
              </ToggleButton>
            </Container>
          </Navbar>

          {/* Main Content */}
          <Container className="py-4">
            <Routes>
              <Route path="/" element={<HomePage provider={provider} />} />
              <Route
                path="/address/:address"
                element={<AddressPage provider={provider} />}
              />
              <Route
                path="/tx/:txHash"
                element={<TransactionPage provider={provider} />}
              />
              <Route
                path="/block/:blockNumber"
                element={<BlockPage provider={provider} />}
              />
            </Routes>
          </Container>

          {/* Network Stats Footer */}
          <footer
            className="py-3 border-top small"
            style={{
              backgroundColor: "#f8f9fa",
              color: "#6c757d",
              textAlign: "center",
            }}
          >
            {loading ? (
              <div className="text-left">
                <Spinner animation="border" variant="primary" />
                <p className="mt-2">Loading block data...</p>
              </div>
            ) : (
              <Container>
                <Row>
                  <Col>
                    <span className="me-3">Network: Mainnet</span>
                    <span className="me-3">
                      Gas: {networkStats.gasPrice} Gwei
                    </span>
                    <span>Last Block: {networkStats.blockNumber}</span>
                  </Col>
                </Row>
                <Row className="mt-2">
                  <Col>
                    <Nav.Link
                      as={Link}
                      to="/"
                      className="text-decoration-none text-muted"
                      style={{ fontSize: "0.8rem" }}
                    >
                      &copy; 2025 EtherScan Clone by Niplan & Sirisk
                    </Nav.Link>
                  </Col>
                </Row>
              </Container>
            )}
          </footer>
        </div>
      </Router>
    </ThemeProvider>
  );
}

// Search Component (reusable)
const SearchBar = () => {
  const [searchInput, setSearchInput] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (ethers.isAddress(searchInput)) {
      navigate(`/address/${searchInput}`);
    } else if (/^0x([A-Fa-f0-9]{64})$/.test(searchInput)) {
      navigate(`/tx/${searchInput}`);
    } else if (/^\d+$/.test(searchInput)) {
      navigate(`/block/${searchInput}`);
    } else {
      alert(
        "Invalid input! Enter an address, transaction hash, or block number."
      );
    }
  };

  return (
    <Form onSubmit={handleSearch} className="d-flex w-50">
      <Form.Control
        type="text"
        placeholder="Search by address / tx hash / block"
        value={searchInput}
        onChange={(e) => setSearchInput(e.target.value)}
      />
      <Button variant="outline-primary" className="ms-2" type="submit">
        Search
      </Button>
    </Form>
  );
};

// Home Page with Blocks/Transactions Tabs
const HomePage = ({ provider }) => {
  const [activeTab, setActiveTab] = useState("blocks");
  const [latestBlockNumber, setLatestBlockNumber] = useState("");
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const blockNumber = await provider.getBlockNumber();

      setLatestBlockNumber(blockNumber);

      const blockWithTxs = await provider.getBlockWithTransactions(blockNumber);
      setTransactions(blockWithTxs.transactions.slice(0, 5));
    };
    fetchData();
  }, [provider]);

  return (
    <>
      <Tabs activeKey={activeTab} onSelect={setActiveTab} className="mb-3">
        <Tab eventKey="blocks" title="Latest Blocks">
          <Row xs={1} md={2} lg={3} className="g-4">
            {Array.from({ length: 6 }, (_, i) => latestBlockNumber - i * 1).map(
              (number) => (
                <Col key={number}>
                  <BlockCard blockNumber={number} provider={provider} />
                </Col>
              )
            )}
          </Row>
        </Tab>
        <Tab eventKey="transactions" title="Latest Transactions">
          <Row xs={1} className="g-4">
            {transactions.map((tx) => (
              <Col key={tx.hash}>
                <TransactionCard tx={tx} />
              </Col>
            ))}
          </Row>
        </Tab>
      </Tabs>
    </>
  );
};

export default App;
