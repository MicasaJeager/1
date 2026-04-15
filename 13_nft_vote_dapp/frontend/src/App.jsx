import { useMemo, useState } from "react";
import { BrowserProvider, Contract, formatEther, parseEther } from "ethers";
import contractAbi from "./contracts/contractAbi.json";

const CONTRACT_ADDRESS =
  import.meta.env.VITE_CONTRACT_ADDRESS || "0x0000000000000000000000000000000000000000";
const TARGET_NETWORK = import.meta.env.VITE_NETWORK_NAME || "Sepolia";

const toFriendlyError = (error) => {
  if (!error) return "Unknown error";
  if (error.code === 4001) return "Wallet window was rejected by user.";
  if (error.code === "INSUFFICIENT_FUNDS") return "Insufficient funds for gas or payment.";
  return error.shortMessage || error.reason || error.message || "Unexpected transaction error.";
};

const formatDate = (unixTs) => new Date(Number(unixTs) * 1000).toLocaleString();
const shortAddress = (value) => `${value.slice(0, 6)}...${value.slice(-4)}`;

function App() {
  const [wallet, setWallet] = useState("");
  const [networkInfo, setNetworkInfo] = useState("-");
  const [contract, setContract] = useState(null);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState({ type: "idle", text: "Ready" });
  const [stats, setStats] = useState({ mintPriceEth: "-", totalProposals: 0 });
  const [proposals, setProposals] = useState([]);

  const [tokenUri, setTokenUri] = useState("ipfs://QmYourMetadataHash/metadata.json");
  const [mintPay, setMintPay] = useState("0.01");

  const [createTitle, setCreateTitle] = useState("");
  const [createDescription, setCreateDescription] = useState("");
  const [createDuration, setCreateDuration] = useState("24");

  const [updateId, setUpdateId] = useState("");
  const [updateTitle, setUpdateTitle] = useState("");
  const [updateDescription, setUpdateDescription] = useState("");
  const [deleteId, setDeleteId] = useState("");

  const hasAddress = useMemo(
    () => CONTRACT_ADDRESS.toLowerCase() !== "0x0000000000000000000000000000000000000000",
    []
  );

  const setTxStatus = (type, text) => setStatus({ type, text });

  const ensureConnected = () => {
    if (!contract || !wallet) {
      setTxStatus("error", "Connect wallet first.");
      return false;
    }
    return true;
  };

  const reloadDashboard = async (activeContract = contract, account = wallet) => {
    if (!activeContract) return;

    const mintPriceWei = await activeContract.mintPrice();
    const total = Number(await activeContract.totalProposals());

    const loaded = [];
    for (let id = total; id >= 1 && loaded.length < 20; id -= 1) {
      const row = await activeContract.getProposal(id);
      const voted = account ? await activeContract.hasVoted(row.id, account) : false;
      loaded.push({
        id: Number(row.id),
        title: row.title,
        description: row.description,
        yesVotes: Number(row.yesVotes),
        noVotes: Number(row.noVotes),
        deadline: Number(row.deadline),
        isActive: row.isActive,
        creator: row.creator,
        voted
      });
    }

    setStats({
      mintPriceEth: formatEther(mintPriceWei),
      totalProposals: total
    });
    setProposals(loaded);
  };

  const connectWallet = async () => {
    if (!hasAddress) {
      setTxStatus("error", "Set VITE_CONTRACT_ADDRESS in .env before connecting.");
      return;
    }

    if (!window.ethereum) {
      setTxStatus("error", "MetaMask is not installed in this browser.");
      return;
    }

    try {
      setBusy(true);
      setTxStatus("pending", "Connecting wallet...");

      await window.ethereum.request({ method: "eth_requestAccounts" });
      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      const network = await provider.getNetwork();
      const writeContract = new Contract(CONTRACT_ADDRESS, contractAbi, signer);

      setWallet(address);
      setNetworkInfo(`${network.name} | chainId: ${network.chainId.toString()}`);
      setContract(writeContract);

      await reloadDashboard(writeContract, address);
      setTxStatus("success", `Connected to ${TARGET_NETWORK}.`);
    } catch (error) {
      setTxStatus("error", toFriendlyError(error));
    } finally {
      setBusy(false);
    }
  };

  const onMint = async (event) => {
    event.preventDefault();
    if (!ensureConnected()) return;

    try {
      setBusy(true);
      setTxStatus("pending", "Mint transaction pending...");
      const tx = await contract.mintNft(tokenUri, { value: parseEther(mintPay) });
      setTxStatus("pending", `Mint sent: ${tx.hash}`);
      await tx.wait();
      setTxStatus("success", "NFT minted successfully.");
      await reloadDashboard();
    } catch (error) {
      setTxStatus("error", toFriendlyError(error));
    } finally {
      setBusy(false);
    }
  };

  const onCreateProposal = async (event) => {
    event.preventDefault();
    if (!ensureConnected()) return;

    try {
      setBusy(true);
      setTxStatus("pending", "Creating proposal...");
      const tx = await contract.createProposal(createTitle, createDescription, Number(createDuration));
      setTxStatus("pending", `Create sent: ${tx.hash}`);
      await tx.wait();
      setTxStatus("success", "Proposal created.");
      setCreateTitle("");
      setCreateDescription("");
      await reloadDashboard();
    } catch (error) {
      setTxStatus("error", toFriendlyError(error));
    } finally {
      setBusy(false);
    }
  };

  const onUpdateProposal = async (event) => {
    event.preventDefault();
    if (!ensureConnected()) return;

    try {
      setBusy(true);
      setTxStatus("pending", "Updating proposal...");
      const tx = await contract.updateProposal(Number(updateId), updateTitle, updateDescription);
      setTxStatus("pending", `Update sent: ${tx.hash}`);
      await tx.wait();
      setTxStatus("success", "Proposal updated.");
      setUpdateId("");
      setUpdateTitle("");
      setUpdateDescription("");
      await reloadDashboard();
    } catch (error) {
      setTxStatus("error", toFriendlyError(error));
    } finally {
      setBusy(false);
    }
  };

  const onDeleteProposal = async (event) => {
    event.preventDefault();
    if (!ensureConnected()) return;

    try {
      setBusy(true);
      setTxStatus("pending", "Deleting proposal...");
      const tx = await contract.deleteProposal(Number(deleteId));
      setTxStatus("pending", `Delete sent: ${tx.hash}`);
      await tx.wait();
      setTxStatus("success", "Proposal deleted.");
      setDeleteId("");
      await reloadDashboard();
    } catch (error) {
      setTxStatus("error", toFriendlyError(error));
    } finally {
      setBusy(false);
    }
  };

  const onVote = async (proposalId, support) => {
    if (!ensureConnected()) return;

    try {
      setBusy(true);
      setTxStatus("pending", "Submitting vote...");
      const tx = await contract.vote(proposalId, support);
      setTxStatus("pending", `Vote sent: ${tx.hash}`);
      await tx.wait();
      setTxStatus("success", "Vote confirmed.");
      await reloadDashboard();
    } catch (error) {
      setTxStatus("error", toFriendlyError(error));
    } finally {
      setBusy(false);
    }
  };

  const onClose = async (proposalId) => {
    if (!ensureConnected()) return;

    try {
      setBusy(true);
      setTxStatus("pending", "Closing proposal...");
      const tx = await contract.closeProposal(proposalId);
      setTxStatus("pending", `Close sent: ${tx.hash}`);
      await tx.wait();
      setTxStatus("success", "Proposal closed.");
      await reloadDashboard();
    } catch (error) {
      setTxStatus("error", toFriendlyError(error));
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="page">
      <section className="hero">
        <div>
          <h1>HealthQueue NFT Vote DApp</h1>
          <p className="sub">
            NFT yaratish, proposal CRUD va on-chain vote jarayonini bitta interfeysda boshqarish.
          </p>
          <p className="mono small">Contract: {CONTRACT_ADDRESS}</p>
        </div>
        <div className="hero-actions">
          <button onClick={connectWallet} disabled={busy}>
            Connect Wallet
          </button>
          <button
            className="ghost"
            onClick={() => reloadDashboard()}
            disabled={busy || !contract}
            type="button"
          >
            Refresh Data
          </button>
        </div>
      </section>

      <section className="stats">
        <article className="stat">
          <span>Wallet</span>
          <strong className="mono">{wallet ? shortAddress(wallet) : "Not connected"}</strong>
        </article>
        <article className="stat">
          <span>Network</span>
          <strong>{networkInfo}</strong>
        </article>
        <article className="stat">
          <span>Mint Price</span>
          <strong>{stats.mintPriceEth} ETH</strong>
        </article>
        <article className="stat">
          <span>Total Proposals</span>
          <strong>{stats.totalProposals}</strong>
        </article>
      </section>

      <section className="grid">
        <article className="card">
          <h2>Mint NFT</h2>
          <form onSubmit={onMint}>
            <label>Token URI (IPFS)</label>
            <input value={tokenUri} onChange={(e) => setTokenUri(e.target.value)} required />
            <label>Payment (ETH)</label>
            <input value={mintPay} onChange={(e) => setMintPay(e.target.value)} required />
            <button disabled={busy} type="submit">
              Mint Now
            </button>
          </form>
        </article>

        <article className="card">
          <h2>Create Proposal</h2>
          <form onSubmit={onCreateProposal}>
            <label>Title</label>
            <input value={createTitle} onChange={(e) => setCreateTitle(e.target.value)} required />
            <label>Description</label>
            <textarea
              value={createDescription}
              onChange={(e) => setCreateDescription(e.target.value)}
              required
            />
            <label>Duration (hours)</label>
            <input
              value={createDuration}
              onChange={(e) => setCreateDuration(e.target.value)}
              type="number"
              min="1"
              max="720"
              required
            />
            <button disabled={busy} type="submit">
              Create Proposal
            </button>
          </form>
        </article>

        <article className="card">
          <h2>Update Proposal</h2>
          <form onSubmit={onUpdateProposal}>
            <label>Proposal ID</label>
            <input value={updateId} onChange={(e) => setUpdateId(e.target.value)} type="number" required />
            <label>New Title</label>
            <input value={updateTitle} onChange={(e) => setUpdateTitle(e.target.value)} required />
            <label>New Description</label>
            <textarea
              value={updateDescription}
              onChange={(e) => setUpdateDescription(e.target.value)}
              required
            />
            <button disabled={busy} type="submit">
              Update
            </button>
          </form>
        </article>

        <article className="card">
          <h2>Delete Proposal</h2>
          <form onSubmit={onDeleteProposal}>
            <label>Proposal ID</label>
            <input value={deleteId} onChange={(e) => setDeleteId(e.target.value)} type="number" required />
            <button disabled={busy} type="submit" className="danger">
              Delete
            </button>
          </form>
        </article>
      </section>

      <section className="card proposals">
        <h2>Proposal List</h2>
        {proposals.length === 0 ? (
          <p className="sub">No proposals loaded yet. Connect wallet and click Refresh Data.</p>
        ) : (
          <div className="proposal-list">
            {proposals.map((proposal) => {
              const expired = Date.now() / 1000 > proposal.deadline;
              return (
                <article key={proposal.id} className="proposal-item">
                  <header>
                    <h3>
                      #{proposal.id} {proposal.title}
                    </h3>
                    <span className={`badge ${proposal.isActive ? "active" : "inactive"}`}>
                      {proposal.isActive ? "Active" : "Closed"}
                    </span>
                  </header>
                  <p>{proposal.description}</p>
                  <div className="meta">
                    <span>Creator: {shortAddress(proposal.creator)}</span>
                    <span>Deadline: {formatDate(proposal.deadline)}</span>
                    <span>
                      Yes/No: {proposal.yesVotes} / {proposal.noVotes}
                    </span>
                    <span>{proposal.voted ? "You voted" : "You have not voted yet"}</span>
                  </div>
                  <div className="actions">
                    <button
                      disabled={busy || !proposal.isActive || expired || proposal.voted}
                      onClick={() => onVote(proposal.id, true)}
                      type="button"
                    >
                      Vote Yes
                    </button>
                    <button
                      disabled={busy || !proposal.isActive || expired || proposal.voted}
                      onClick={() => onVote(proposal.id, false)}
                      type="button"
                      className="ghost"
                    >
                      Vote No
                    </button>
                    <button
                      disabled={busy || !proposal.isActive}
                      onClick={() => onClose(proposal.id)}
                      type="button"
                      className="ghost"
                    >
                      Close
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <section className={`status status-${status.type}`}>
        <strong>{status.type.toUpperCase()}</strong>
        <span>{status.text}</span>
      </section>
    </main>
  );
}

export default App;

