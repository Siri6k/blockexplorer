import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { Card, Spinner, Badge } from "react-bootstrap";

import { formatWeiToEth, formatGas } from "../utils/settings";

const TransactionPage = (props) => {
  const { txHash } = useParams();
  const [tx, setTx] = useState(null);
  const [receipt, setReceipt] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const transaction = await props.provider.getTransaction(txHash);
      const receipt = await props.provider.getTransactionReceipt(txHash);
      setTx(transaction);
      setReceipt(receipt);
    };
    fetchData();
  }, [txHash, props.provider]);

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
          <strong>Block: </strong>
          <Link
            to={`/block/${parseInt(tx.blockNumber)}`}
            className="text-decoration-none block-link"
          >
            {tx.blockNumber}
          </Link>
        </p>

        <p>
          <strong>From: </strong>
          <Link
            to={`/address/${tx.from}`}
            className="text-decoration-none block-link"
          >
            {tx.from}
          </Link>{" "}
        </p>
        <p>
          <strong>To: </strong>
          {tx.to ? (
            <Link
              to={`/address/${tx.to}`}
              className="text-decoration-none block-link"
            >
              {tx.to}
            </Link>
          ) : (
            "Contract creation"
          )}
        </p>
        <p>
          <strong>Value:</strong> {formatWeiToEth(tx.value)} ETH
        </p>
        <p>
          <strong>Confirmations: </strong> {tx.confirmations} confirmations
        </p>
        <p>
          <strong>Gas Price: </strong> {formatGas(tx.gasPrice)} Gwei{" "}
          {formatWeiToEth(tx.gasPrice)} ETH
        </p>
      </Card.Body>
    </Card>
  );
};

export default TransactionPage;
