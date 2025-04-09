import React, { useState, useEffect } from "react";
import { Card, Button, Spinner, Alert, Badge } from "react-bootstrap";
import { ethers } from "ethers";
import alchemy from "../utils/settings";


const EthereumTransactionCard = ({ txHash }) => {
  const [transaction, setTransaction] = useState(null);
  const [receipt, setReceipt] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  // Fetch transaction details
  const fetchTransaction = async () => {
    if (!txHash) return;

    setLoading(true);
    try {
      const provider =  alchemy.core;

      // Get transaction and receipt
      const tx = await provider.getTransaction(txHash);
      const txReceipt = await provider.getTransactionReceipt(txHash);

      setTransaction(tx);
      setReceipt(txReceipt);
    } catch (err) {
      setError("Failed to fetch transaction: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransaction();
  }, [txHash]);

  // Format ETH value (wei → ETH)
  const formatEth = (wei) => {
    return ethers.formatEther(wei) + " ETH";
  };

  return (
    <Card className="shadow-sm" style={{ maxWidth: "600px" }}>
      <Card.Header className="bg-dark text-white">
        <h5 className="mb-0">
          Transaction Details{" "}
          {receipt && (
            <Badge bg={receipt.status === 1 ? "success" : "danger"}>
              {receipt.status === 1 ? "Success" : "Failed"}
            </Badge>
          )}
        </h5>
      </Card.Header>
      <Card.Body>
        {error && <Alert variant="danger">{error}</Alert>}

        {loading ? (
          <div className="text-center">
            <Spinner animation="border" variant="primary" />
            <p className="mt-2">Loading transaction...</p>
          </div>
        ) : transaction ? (
          <div>
            <p>
              <strong>Hash:</strong>{" "}
              <small className="text-muted">{transaction.hash}</small>
            </p>
            <p>
              <strong>From:</strong>{" "}
              <small className="text-muted">{transaction.from}</small>
            </p>
            <p>
              <strong>To:</strong>{" "}
              <small className="text-muted">
                {transaction.to || "Contract Creation"}
              </small>
            </p>
            <p>
              <strong>Value:</strong> {formatEth(transaction.value)}
            </p>
            <p>
              <strong>Gas Price:</strong>{" "}
              {ethers.formatUnits(transaction.gasPrice, "gwei")} Gwei
            </p>
            {receipt && (
              <>
                <p>
                  <strong>Block:</strong> {receipt.blockNumber}
                </p>
                <p>
                  <strong>Gas Used:</strong> {receipt.gasUsed.toString()}
                </p>
              </>
            )}
          </div>
        ) : (
          <p>No transaction data. Provide a valid transaction hash.</p>
        )}
      </Card.Body>
      <Card.Footer>
        <Button variant="primary" onClick={fetchTransaction} disabled={loading}>
          {loading ? "Refreshing..." : "Refresh Data"}
        </Button>
      </Card.Footer>
    </Card>
  );
};

// Example usage:
// <EthereumTransactionCard txHash="0x..." />
export default EthereumTransactionCard;
