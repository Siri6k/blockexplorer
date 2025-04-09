import React, { useState, useEffect } from "react";
import { Card, Button, Spinner, Alert, Badge } from "react-bootstrap";
import { ethers } from "ethers";
import alchemy from "../utils/settings";
import { formatGas, formatWeiToEth } from "../utils/settings";
import { Link } from "react-router-dom";

const EthereumTransactionCard = (props) => {
  const [transaction, setTransaction] = useState(null);
  const [receipt, setReceipt] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  // Fetch transaction details
  const fetchTransaction = async () => {
    if (!props.txHash) return;

    setLoading(true);
    try {
      const provider = alchemy.core;

      // Get transaction and receipt
      const tx = await provider.getTransaction(props.txHash);
      const txReceipt = await provider.getTransactionReceipt(props.txHash);

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
  }, [props.txHash]);

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
              <small className="text-muted ">
                {" "}
                <Link
                  to={`/tx/${transaction.hash}`}
                  className="text-decoration-none block-link"
                >
                  {transaction.hash.substring(0, 16)}....
                  {transaction.hash.slice(-10)}
                </Link>
              </small>
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
              <strong>Value:</strong> {formatWeiToEth(transaction.value)}
            </p>
            <p>
              <strong>Gas Price:</strong> {formatGas(transaction.gasPrice)} Gwei
            </p>
            {receipt && (
              <>
                <p>
                  <strong>Block:</strong>{" "}
                  <Link
                    to={`/block/${receipt.blockNumber}`}
                    className="text-decoration-none block-link"
                  >
                    {receipt.blockNumber}
                  </Link>
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
        <Button
          variant="primary"
          onClick={fetchTransaction}
          disabled={loading}
          className="w-50 text-center mx-auto d-block"
        >
          {loading ? "Refreshing..." : "Refresh Data"}
        </Button>
      </Card.Footer>
    </Card>
  );
};

export default EthereumTransactionCard;
