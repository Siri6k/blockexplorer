import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { ethers } from "ethers";
import { Card, Badge, Spinner, Tab, Tabs } from "react-bootstrap";

const AddressPage = ({ provider }) => {
  const { address } = useParams();
  const [balance, setBalance] = useState("");
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const balance = await provider.getBalance(address);
      setBalance(ethers.formatEther(balance));

      // Note: For full tx history, use Etherscan API (see below)
      setLoading(false);
    };
    fetchData();
  }, [address, provider]);

  return (
    <Card>
      <Card.Header>
        <h4>
          Address: <small className="text-muted">{address}</small>
        </h4>
      </Card.Header>
      <Card.Body>
        {loading ? (
          <Spinner animation="border" />
        ) : (
          <Tabs defaultActiveKey="overview">
            <Tab eventKey="overview" title="Overview">
              <p>
                <strong>Balance:</strong> {balance} ETH
              </p>
            </Tab>
            <Tab eventKey="transactions" title="Transactions">
              {/* Transaction list would go here */}
            </Tab>
          </Tabs>
        )}
      </Card.Body>
    </Card>
  );
};

export default AddressPage;
