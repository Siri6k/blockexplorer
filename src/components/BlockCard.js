import React, { useState, useEffect } from "react";
import { Card, Button, Spinner, Alert } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

const BlockCard = (props) => {
  const [block, setBlock] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  async function getBlock() {
    setLoading(true);
    setError(null);
    try {
      const block = await props.provider.getBlock(props.blockNumber);
      if (!block) {
        setError("No block data available.");
        setLoading(false);
        return;
      }
      setBlock(block);
      setLoading(false);
    } catch (err) {
      setError("Failed to fetch block data. Please try again.");
      setLoading(false);
    }
  }
  useEffect(() => {
    getBlock();
  }, [props.blockNumber, props.provider]);

  return (
    <Card
      className="shadow-sm"
      style={{ maxWidth: "1500px", marginTop: "20px" }}
    >
      <Card.Header className="bg-dark text-white">
        <h5 className="mb-0">Ethereum Block Details</h5>
      </Card.Header>
      <Card.Body>
        {error && <Alert variant="danger">{error}</Alert>}

        {loading ? (
          <div className="text-center">
            <Spinner animation="border" variant="primary" />
            <p className="mt-2">Loading block data...</p>
          </div>
        ) : block ? (
          <div>
            <p>
              <strong>Block Number: </strong>
              <span onClick={() => navigate(`/block/${block.number}`)}>
                {block.number}
              </span>
            </p>
            <p>
              <strong>Hash:</strong>{" "}
              <small className="text-muted">
                <span onClick={() => navigate(`/block/${block.number}`)}>
                  {block.hash.slice(0, 20)}...{block.hash.slice(-4)}
                </span>
              </small>
            </p>
            <p>
              <strong>Timestamp:</strong>{" "}
              {new Date(block.timestamp * 1000).toLocaleString()}
            </p>
            <p>
              <strong>Transactions:</strong> {block.transactions.length}{" "}
              transactions
            </p>
            <p>
              <strong>Miner:</strong>{" "}
              <small className="text-muted">
                {block.miner.slice(0, 20)}...{block.miner.slice(-4)}
              </small>
            </p>
          </div>
        ) : (
          <p>No block data available.</p>
        )}
      </Card.Body>
      <Card.Footer className="text-muted" style={{ textAlign: "center" }}>
        <Button variant="primary" onClick={getBlock}>
          Refresh Block Data
        </Button>
        <p className="mt-2">
          <small>Latest Block Number: {props.blockNumber}</small>
        </p>
      </Card.Footer>
    </Card>
  );
};

export default BlockCard;
