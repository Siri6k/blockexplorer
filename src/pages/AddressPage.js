import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { ethers } from "ethers";
import {
  Card,
  Badge,
  Spinner,
  Tab,
  Tabs,
  Alert,
  Table,
  Dropdown,
} from "react-bootstrap";
import { formatWeiToEth, formatDecimal } from "../utils/settings";

const AddressPage = (props) => {
  const { address } = useParams();
  const [balance, setBalance] = useState("");
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showMore, setShowMore] = useState(true);
  const [showMoreCount, setShowMoreCount] = useState(5);
  const [ownerTokens, setOwnerTokens] = useState([]);
  const [showMoreTokensCount, setShowMoreTokensCount] = useState(5);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const balance = await props.provider.getBalance(address);
        setBalance(formatWeiToEth(balance));

        const txs = await props.provider.getAssetTransfers({
          fromBlock: "0x0",
          toAddress: address,
          category: ["external", "internal", "erc20", "erc721"],
        });

        txs.transfers.forEach((tx) => {
          setTransactions((prev) => [...prev, tx]);
        });

        const tokens = await props.provider.getTokensForOwner(address);
        setOwnerTokens([]);
        tokens.tokens.forEach((token) => {
          setOwnerTokens((prev) => [...prev, token]);
        });

        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };
    fetchData();
  }, [address, props.provider]);

  const showMoreTransactions = () => {
    setShowMoreCount((prev) => prev + 5);
    if (showMoreCount > transactions.length - 1) {
      setShowMoreCount(transactions.length - 1);
      setShowMore(false);
    }
  };
  const showMoreTokens = () => {
    setShowMoreTokensCount((prev) => prev + 5);
    if (showMoreTokens > ownerTokens.length - 1) {
      setShowMoreTokensCount(transactions.length - 1);
      setShowMore(false);
    }
  };

  return (
    <Card style={{ minHeight: "70vh" }}>
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
              <p className="mt-3">
                <strong>Balance:</strong> {balance} ETH
              </p>

              {/* Tokens list would go here */}

              <Dropdown className="mb-5">
                <Dropdown.Toggle variant="secondary" id="dropdown-basic">
                  {ownerTokens.length || "0"} Tokens
                </Dropdown.Toggle>

                <Dropdown.Menu>
                  {ownerTokens.length === 0 ? (
                    <Dropdown.Item disabled>No Tokens</Dropdown.Item>
                  ) : (
                    ownerTokens
                      .slice(0, showMoreTokensCount)
                      .map((token, index) => (
                        <Dropdown.Item key={index} href="#/action-1">
                          <div className="d-flex justify-content-between flex-wrap">
                            <span className="font-monospace">
                              {token.logo && (
                                <img
                                  src={token.logo}
                                  style={{ height: "auto", maxHeight: "20px" }}
                                />
                              )}{" "}
                              {token.name.substring(0, 5)}...
                              {token.name.slice(-2)}
                            </span>{" "}
                            -
                            <span className="text-muted">
                              {formatDecimal(token.balance)} {token.symbol}
                            </span>
                          </div>
                        </Dropdown.Item>
                      ))
                  )}
                  {showMore && ownerTokens.length > showMoreTokensCount && (
                    <Dropdown.Item
                      onClick={(e) => {
                        e.preventDefault();
                        showMoreTokens();
                      }}
                      className="text-center"
                    >
                      Show More Tokens
                    </Dropdown.Item>
                  )}
                </Dropdown.Menu>
              </Dropdown>
            </Tab>
            <Tab eventKey="transactions" title="Transactions">
              {/* Transaction list would go here */}
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
                          <th>Asset</th>
                        </tr>
                      </thead>
                      <tbody>
                        {transactions
                          .slice(0, showMoreCount)
                          .map((tx, index) => (
                            <tr key={index}>
                              <td className="font-monospace">
                                <Link to={`/tx/${tx.hash}`}>
                                  {tx.hash.substring(0, 16)}...
                                </Link>
                              </td>
                              <td className="font-monospace">
                                <Link to={`/address/${tx.from}`}>
                                  {tx.from.substring(0, 8)}...
                                  {tx.from.substring(36)}
                                </Link>
                              </td>
                              <td className="font-monospace">
                                {tx.to ? (
                                  <Link to={`/address/${tx.to}`}>
                                    {tx.to.substring(0, 8)}...
                                    {tx.to.substring(36)}
                                  </Link>
                                ) : (
                                  <span className="text-muted">
                                    Contract Creation
                                  </span>
                                )}
                              </td>
                              <td>
                                {tx.value} {tx.asset}
                              </td>
                              <td>{tx.asset}</td>
                            </tr>
                          ))}
                      </tbody>
                    </Table>
                  )}
                </Card.Body>
                <Card.Footer className="text-center">
                  {showMore && transactions.length > showMoreCount && (
                    <button
                      className="btn btn-primary"
                      onClick={showMoreTransactions}
                    >
                      Show More Transactions
                    </button>
                  )}
                </Card.Footer>
              </Card>
            </Tab>
          </Tabs>
        )}
      </Card.Body>
    </Card>
  );
};

export default AddressPage;
