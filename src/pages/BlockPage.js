import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Container,
  Row,
  Col,
  Card,
  Badge,
  Spinner,
  Alert,
  Table,
} from "react-bootstrap";
import { ethers } from "ethers";

const BlockPage = (props) => {
  const { blockNumber } = useParams();
  const [block, setBlock] = useState({});
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showMore, setShowMore] = useState(true);
  const [showMoreCount, setShowMoreCount] = useState(5);

  const fetchBlockData = async () => {
    setError(null);
    setLoading(true);

    try {
      const blockData = await props.provider.getBlock(parseInt(blockNumber));

      if (!blockData) {
        setError("No block data available.");
        setLoading(false);
        return;
      }

      setBlock(blockData);

      blockData.transactions.forEach(async (txHash) => {
        const tx = await props.provider.getTransaction(txHash);
        if (!tx) {
          return;
        }
        setTransactions((prev) => [...prev, tx]);
      });

      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };
  const showMoreTransactions = () => {
    setShowMoreCount((prev) => prev + 5);
    if (showMoreCount > transactions.length - 1) {
      setShowMoreCount(transactions.length - 1);
      setShowMore(false);
    }
  };

  useEffect(() => {
    fetchBlockData();
  }, [blockNumber, props.provider]);

  if (loading) {
    return (
      <Container className="text-center py-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p>Loading block data...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-5">
        <Alert variant="danger">Error loading block: {error}</Alert>
      </Container>
    );
  }

  if (!block) {
    return (
      <Container className="py-5">
        <Alert variant="warning">Block not found</Alert>
      </Container>
    );
  }

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleString();
  };

  const formatWeiToEth = (wei) => {
    const intValue = wei.toString(); // Convert to string representation
    const ethValue = ethers.formatUnits(intValue, "ether");
    return parseFloat(ethValue).toFixed(4);
  };

  const formatGas = (gas) => {
    // Already a BigNumber, no need for parseUnits
    const intValue = gas.toString(); // Convert to string representation

    // Convert to Gwei
    const gasPriceInGwei = ethers.formatUnits(intValue, "gwei");
    return parseFloat(gasPriceInGwei).toFixed(2);
  };

  return (
    <Container className="py-4">
      <h2 className="mb-4">Block #{block.number}</h2>

      <Row
        className="mb-4"
        style={{
          display: "flex",
          justifyContent: "space-evenly",
          alignItems: "flex-start",
          flexWrap: "wrap",
        }}
      >
        <Col md={6} style={{ minWidth: "300px", maxWidth: "800px" }}>
          <Card className="mb-3">
            <Card.Header>Overview</Card.Header>
            <Card.Body>
              <Table borderless size="sm">
                <tbody>
                  <tr>
                    <td className="text-muted">Block Height:</td>
                    <td>{block.number}</td>
                  </tr>
                  <tr>
                    <td className="text-muted">Timestamp:</td>
                    <td>{formatTimestamp(block.timestamp)}</td>
                  </tr>
                  <tr>
                    <td className="text-muted">Transactions:</td>
                    <td>
                      {transactions.length} transactions
                      {block.gasUsed && (
                        <span>
                          {" "}
                          ({((block.gasUsed / block.gasLimit) * 100).toFixed(2)}
                          % gas used)
                        </span>
                      )}
                    </td>
                  </tr>
                  <tr>
                    <td className="text-muted text-break">Miner:</td>
                    <td className="text-break">
                      <Link to={`/address/${block.miner}`}>{block.miner}</Link>
                    </td>
                  </tr>
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6} style={{ minWidth: "300px", maxWidth: "800px" }}>
          <Card className="mb-3">
            <Card.Header>Block Details</Card.Header>
            <Card.Body>
              <Table borderless size="sm">
                <tbody>
                  <tr>
                    <td className="text-muted">Hash:</td>
                    <td className="font-monospace text-break">{block.hash}</td>
                  </tr>
                  <tr>
                    <td className="text-muted">Parent Hash:</td>
                    <td className="font-monospace text-break">
                      <Link to={`/block/${block.number - 1}`}>
                        {block.parentHash}
                      </Link>
                    </td>
                  </tr>
                  <tr>
                    <td className="text-muted">Gas Limit:</td>
                    <td>{block.gasLimit.toString()}</td>
                  </tr>
                  <tr>
                    <td className="text-muted">Gas Used:</td>
                    <td>{block.gasUsed.toString()}</td>
                  </tr>
                  <tr>
                    <td className="text-muted">Base Fee Per Gas:</td>
                    <td>
                      {block.baseFeePerGas
                        ? `${formatGas(block.baseFeePerGas)} Gwei`
                        : "N/A"}
                    </td>
                  </tr>
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Card>
        <Card.Header>
          Transactions{" "}
          {transactions.length > 0 && (
            <Badge bg="secondary" className="ms-2">
              {transactions.length}
            </Badge>
          )}
        </Card.Header>
        <Card.Body>
          {transactions.length === 0 ? (
            <Alert variant="info">No transactions in this block</Alert>
          ) : (
            <Table striped bordered hover responsive>
              <thead>
                <tr>
                  <th>Transaction Hash</th>
                  <th>From</th>
                  <th>To</th>
                  <th>Value</th>
                  <th>Gas Price</th>
                </tr>
              </thead>
              <tbody>
                {transactions.slice(0, showMoreCount).map((tx, index) => (
                  <tr key={index}>
                    <td className="font-monospace">
                      <Link to={`/tx/${tx.hash}`}>
                        {tx.hash.substring(0, 16)}...
                      </Link>
                    </td>
                    <td className="font-monospace">
                      <Link to={`/address/${tx.from}`}>
                        {tx.from.substring(0, 8)}...{tx.from.substring(36)}
                      </Link>
                    </td>
                    <td className="font-monospace">
                      {tx.to ? (
                        <Link to={`/address/${tx.to}`}>
                          {tx.to.substring(0, 8)}...{tx.to.substring(36)}
                        </Link>
                      ) : (
                        <span className="text-muted">Contract Creation</span>
                      )}
                    </td>
                    <td>{formatWeiToEth(tx.value)} ETH</td>
                    <td>
                      {tx.gasPrice ? `${formatGas(tx.gasPrice)} Gwei` : "N/A"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
        <Card.Footer className="text-center">
          {showMore && transactions.length > showMoreCount && (
            <button className="btn btn-primary" onClick={showMoreTransactions}>
              Show More Transactions
            </button>
          )}
        </Card.Footer>
      </Card>
    </Container>
  );
};

export default BlockPage;
