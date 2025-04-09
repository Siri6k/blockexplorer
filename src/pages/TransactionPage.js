import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { ethers } from "ethers";
import { Card, Spinner, Badge } from "react-bootstrap";

const TransactionPage = ({ provider }) => {
  const { txHash } = useParams();
  const [tx, setTx] = useState(null);
  const [receipt, setReceipt] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const transaction = await provider.getTransaction(txHash);
      const receipt = await provider.getTransactionReceipt(txHash);
      setTx(transaction);
      setReceipt(receipt);
    };
    fetchData();
  }, [txHash, provider]);

  if (!tx) return <Spinner animation="border" />;

  return (
    <Card>
      <Card.Header>
        <h4>
          Transaction <small className="text-muted">{txHash}</small>
        </h4>
      </Card.Header>
      <Card.Body>
        <p>
          <strong>Status:</strong>{" "}
          <Badge bg={receipt?.status ? "success" : "danger"}>
            {receipt?.status ? "Success" : "Failed"}
          </Badge>
        </p>
        <p>
          <strong>From:</strong> {tx.from}
        </p>
        <p>
          <strong>To:</strong> {tx.to || "Contract Creation"}
        </p>
        <p>
          <strong>Value:</strong> {ethers.formatEther(tx.value)} ETH
        </p>
      </Card.Body>
    </Card>
  );
};

export default TransactionPage;
