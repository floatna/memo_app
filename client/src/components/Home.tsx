// client/src/components/Home.tsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

type Folder = {
  id: number;
  name: string;
};

type Card = {
  id: number;
  title: string;
  body: string;
};

function Home() {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [cards, setCards] = useState<Card[]>([]);
  const [newFolderName, setNewFolderName] = useState("");
  const [newCardTitle, setNewCardTitle] = useState("");
  const [newCardBody, setNewCardBody] = useState("");
  const [editingFolder, setEditingFolder] = useState<Folder | null>(null);
  const [editingCard, setEditingCard] = useState<Card | null>(null);

  useEffect(() => {
    fetch("http://localhost:3000/api/folders")
      .then((res) => res.json())
      .then((data) => {
        setFolders(data);
        setCards(data.flatMap((folder: any) => folder.cards || []));
      })
      .catch((err) => console.error("API error:", err));
  }, []);

  const handleAddFolder = () => {
    fetch("http://localhost:3000/folders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newFolderName }),
    }).then(() => {
      setNewFolderName("");
      window.location.reload();
    });
  };

  const handleUpdateFolder = () => {
    if (!editingFolder) return;
    fetch(`http://localhost:3000/folders/${editingFolder.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: editingFolder.name }),
    }).then(() => {
      setEditingFolder(null);
      window.location.reload();
    });
  };

  const handleAddCard = () => {
    fetch("http://localhost:3000/cards", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: newCardTitle, body: newCardBody }),
    }).then(() => {
      setNewCardTitle("");
      setNewCardBody("");
      window.location.reload();
    });
  };

  const handleUpdateCard = () => {
    if (!editingCard) return;
    fetch(`http://localhost:3000/cards/${editingCard.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: editingCard.title, body: editingCard.body }),
    }).then(() => {
      setEditingCard(null);
      window.location.reload();
    });
  };

  return (
    <div style={{ padding: "1rem" }}>
      <h1>トップフォルダ一覧</h1>
      <ul>
        {folders.map((folder) => (
          <li key={folder.id}>
            <Link to={`/folders/${folder.id}`}>{folder.name}</Link>
            <button onClick={() => setEditingFolder(folder)}>編集</button>
          </li>
        ))}
      </ul>

      {editingFolder && (
        <div>
          <h3>フォルダ編集</h3>
          <input
            type="text"
            value={editingFolder.name}
            onChange={(e) =>
              setEditingFolder({ ...editingFolder, name: e.target.value })
            }
          />
          <button onClick={handleUpdateFolder}>更新</button>
        </div>
      )}

      <h2>カード一覧</h2>
      {cards.map((card) => (
        <div key={card.id} style={{ border: "1px solid #ccc", padding: "0.5rem", marginBottom: "0.5rem" }}>
          <h3>
            <Link to={`/cards/${card.id}`}>{card.title}</Link>
          </h3>

          <p>{card.body}</p>
          <button onClick={() => setEditingCard(card)}>編集</button>
        </div>
      ))}

      {editingCard && (
        <div>
          <h3>カード編集</h3>
          <input
            type="text"
            value={editingCard.title}
            onChange={(e) =>
              setEditingCard({ ...editingCard, title: e.target.value })
            }
          />
          <textarea
            value={editingCard.body}
            onChange={(e) =>
              setEditingCard({ ...editingCard, body: e.target.value })
            }
          />
          <br />
          <button onClick={handleUpdateCard}>更新</button>
        </div>
      )}

      <h2>フォルダ作成</h2>
      <input
        type="text"
        placeholder="新しいフォルダ名"
        value={newFolderName}
        onChange={(e) => setNewFolderName(e.target.value)}
      />
      <button onClick={handleAddFolder}>作成</button>

      <h2>カード作成</h2>
      <input
        type="text"
        placeholder="カードタイトル"
        value={newCardTitle}
        onChange={(e) => setNewCardTitle(e.target.value)}
      />
      <br />
      <textarea
        placeholder="本文"
        value={newCardBody}
        onChange={(e) => setNewCardBody(e.target.value)}
      />
      <br />
      <button onClick={handleAddCard}>作成</button>
    </div>
  );
}

export default Home;
