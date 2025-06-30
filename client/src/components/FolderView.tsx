import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";

type Card = {
  id: number;
  title: string;
  body: string;
  image_url?: string;
};

type Folder = {
  id: number;
  name: string;
  cards: Card[];
  children: Folder[];
};

function FolderView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [folder, setFolder] = useState<Folder | null>(null);

  const [newFolderName, setNewFolderName] = useState("");
  const [newCardTitle, setNewCardTitle] = useState("");
  const [newCardBody, setNewCardBody] = useState("");
  const [newCardImage, setNewCardImage] = useState<File | null>(null);

  useEffect(() => {
    fetch("http://localhost:3000/api/folders")
      .then((res) => res.json())
      .then((data: Folder[]) => {
        const findFolder = (folders: Folder[]): Folder | null => {
          for (const f of folders) {
            if (f.id.toString() === id) return f;
            const child = findFolder(f.children);
            if (child) return child;
          }
          return null;
        };
        setFolder(findFolder(data));
      });
  }, [id]);

  const handleAddFolder = () => {
    fetch("http://localhost:3000/folders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newFolderName, parent_id: folder?.id }),
    }).then(() => {
      setNewFolderName("");
      window.location.reload();
    });
  };

  const handleAddCard = () => {
    const formData = new FormData();
    formData.append("card[title]", newCardTitle);
    formData.append("card[body]", newCardBody);
    if (newCardImage) {
      formData.append("card[image]", newCardImage);
    }
    if (folder?.id) {
      formData.append("card[folder_id]", folder.id.toString());
    }

    fetch("http://localhost:3000/cards", {
      method: "POST",
      body: formData,
    }).then(() => {
      setNewCardTitle("");
      setNewCardBody("");
      setNewCardImage(null);
      window.location.reload();
    });
  };

  if (!folder) return <p>読み込み中...</p>;

  return (
    <div style={{ padding: "1rem" }}>
      <button onClick={() => navigate(-1)}>← 戻る</button>
      <h1>{folder.name} の中身</h1>

      <h2>サブフォルダ</h2>
      <ul>
        {folder.children.map((child) => (
          <li key={child.id}>
            <Link to={`/folders/${child.id}`}>{child.name}</Link>
          </li>
        ))}
      </ul>

      <h2>カード一覧</h2>
      {folder.cards.map((card) => (
        <div
          key={card.id}
          style={{
            border: "1px solid #ccc",
            padding: "0.5rem",
            marginBottom: "0.5rem",
          }}
        >
          <h3>
            <Link to={`/cards/${card.id}`}>{card.title}</Link>
          </h3>
          <p>{card.body}</p>
          {card.image_url && (
            <img
              src={card.image_url}
              alt={card.title}
              style={{ maxWidth: "200px", marginTop: "0.5rem" }}
            />
          )}
        </div>
      ))}

      <h3>フォルダ作成</h3>
      <input
        type="text"
        placeholder="新しいフォルダ名"
        value={newFolderName}
        onChange={(e) => setNewFolderName(e.target.value)}
      />
      <button onClick={handleAddFolder}>作成</button>

      <h3>カード作成</h3>
      <input
        type="text"
        placeholder="タイトル"
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
      <input
        type="file"
        accept="image/*"
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            setNewCardImage(e.target.files[0]);
          }
        }}
      />
      <br />
      <button onClick={handleAddCard}>作成</button>
    </div>
  );
}

export default FolderView;
