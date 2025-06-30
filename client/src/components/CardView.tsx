// client/src/components/CardView.tsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

type Card = {
  id: number;
  title: string;
  body: string;
  image_url?: string;
};

function CardView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [card, setCard] = useState<Card | null>(null);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [image, setImage] = useState<File | null>(null);

  useEffect(() => {
    fetch(`http://localhost:3000/cards/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setCard(data);
        setTitle(data.title);
        setBody(data.body);
      });
  }, [id]);

  const handleUpdate = () => {
    const formData = new FormData();
    formData.append("card[title]", title);
    formData.append("card[body]", body);
    if (image) formData.append("card[image]", image);

    fetch(`http://localhost:3000/cards/${id}`, {
      method: "PUT",
      body: formData,
    })
      .then(() => {
        alert("更新されました");
        navigate(-1);
      });
  };

  if (!card) return <p>読み込み中...</p>;

  return (
    <div style={{ padding: "1rem" }}>
      <button onClick={() => navigate(-1)}>← 戻る</button>
      <h1>カード詳細</h1>

      <h2>{card.title}</h2>
      <p>{card.body}</p>
      {card.image_url && (
        <img
          src={`http://localhost:3000${card.image_url}`}
          alt="添付画像"
          style={{ maxWidth: "300px", display: "block", marginBottom: "1rem" }}
        />
      )}

      <h3>編集フォーム</h3>
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="タイトル"
      />
      <br />
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="本文"
      />
      <br />
      <input type="file" accept="image/*" onChange={(e) => {
        if (e.target.files?.[0]) {
          setImage(e.target.files[0]);
        }
      }} />
      <br />
      <button onClick={handleUpdate}>更新</button>
    </div>
  );
}

export default CardView;
