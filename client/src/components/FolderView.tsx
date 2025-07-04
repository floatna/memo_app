// src/pages/FolderView.tsx
import {
  useEffect,
  useState,
  type CSSProperties,
  type ChangeEvent,
} from "react";
import { useParams, useNavigate, Link } from "react-router-dom";

import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  arrayMove,
  horizontalListSortingStrategy,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

/* =========================================
   設定
========================================= */
const API_BASE = "http://localhost:3000"; // ← バックエンド URL に合わせて変更

/* API が相対パスを返す場合は絶対化 */
const imgSrc = (path: string | null) =>
  path && !path.startsWith("http") ? `${API_BASE}${path}` : path ?? undefined;

/* =========================================
   型
========================================= */
type Card = {
  id: number;
  title: string;
  body: string;
  image_url: string | null;
};

type Subfolder = { id: number; name: string };

interface FolderResp {
  id: number;
  name: string;
  cards: Card[];
  children?: Subfolder[];
  subfolders?: Subfolder[]; // key 名が異なる API の場合用
}

/* =========================================
   ページコンポーネント
========================================= */
export default function FolderView() {
  const { id } = useParams<{ id: string }>();
  const folderId = Number(id);
  const navigate = useNavigate();

  /* 状態 */
  const [folder, setFolder] = useState<FolderResp | null>(null);
  const [cards, setCards] = useState<Card[]>([]);
  const [subfolders, setSubfolders] = useState<Subfolder[]>([]);
  const [loading, setLoading] = useState(true);

  /* 作成用 */
  const [newFolderName, setNewFolderName] = useState("");
  const [newCardTitle, setNewCardTitle] = useState("");
  const [newCardBody, setNewCardBody] = useState("");
  const [newCardImage, setNewCardImage] = useState<File | null>(null);

  /* ======================================
     データ取得
  ====================================== */
  useEffect(() => {
    setLoading(true);
    fetch(`${API_BASE}/api/folders/${folderId}`)
      .then((r) => r.json())
      .then((data: FolderResp) => {
        setFolder(data);
        setCards(data.cards);
        setSubfolders(data.children ?? data.subfolders ?? []);
      })
      .finally(() => setLoading(false));
  }, [folderId]);

  /* ======================================
     dnd-kit sensors
  ====================================== */
  const sensors = useSensors(useSensor(PointerSensor));

  /* ---------- サブフォルダ並び替え ---------- */
  const onDragEndFolders = (ev: DragEndEvent) => {
    const { active, over } = ev;
    if (!over || active.id === over.id) return;

    const oldIdx = subfolders.findIndex((f) => f.id === active.id);
    const newIdx = subfolders.findIndex((f) => f.id === over.id);
    const ordered = arrayMove(subfolders, oldIdx, newIdx);
    setSubfolders(ordered);

    fetch(`${API_BASE}/folders/sort`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ order: ordered.map((f) => f.id) }),
    });
  };

  /* ---------- カード並び替え ---------- */
  const onDragEndCards = (ev: DragEndEvent) => {
    const { active, over } = ev;
    if (!over || active.id === over.id) return;

    const oldIdx = cards.findIndex((c) => c.id === active.id);
    const newIdx = cards.findIndex((c) => c.id === over.id);
    const ordered = arrayMove(cards, oldIdx, newIdx);
    setCards(ordered);

    fetch(`${API_BASE}/api/cards/sort`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ order: ordered.map((c) => c.id) }),
    });
  };

  /* ======================================
     フォルダ・カード追加
  ====================================== */
  const addFolder = () => {
    if (!newFolderName.trim()) return;
    fetch(`${API_BASE}/folders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newFolderName, parent_id: folderId }),
    })
      .then((r) => r.json())
      .then((created: Subfolder) => {
        setSubfolders((p) => [...p, created]);
        setNewFolderName("");
      });
  };

  const addCard = () => {
    if (!newCardTitle.trim()) return;

    const form = new FormData();
    form.append("card[title]", newCardTitle);
    form.append("card[body]", newCardBody);
    if (newCardImage) form.append("card[image]", newCardImage);
    form.append("card[folder_id]", String(folderId));

    fetch(`${API_BASE}/cards`, { method: "POST", body: form })
      .then((r) => r.json())
      .then((c: Card) =>
        c.image_url
          ? c
          : fetch(`${API_BASE}/cards/${c.id}`).then((r) => r.json())
      )
      .then((card: Card) => {
        setCards((p) => [...p, card]);
        setNewCardTitle("");
        setNewCardBody("");
        setNewCardImage(null);
      });
  };

  /* ======================================
     Sortable コンポーネント
  ====================================== */
  const SortableFolderRow = ({ folder }: { folder: Subfolder }) => {
    const { attributes, listeners, setNodeRef, transform, transition } =
      useSortable({ id: folder.id });

    const style: CSSProperties = {
      ...css.sideRow,
      transform: CSS.Transform.toString(transform),
      transition,
      touchAction: "none",
    };

    return (
      <li ref={setNodeRef} {...attributes} {...listeners} style={style}>
        <Link to={`/folders/${folder.id}`} style={css.sideLink}>
          {folder.name}
        </Link>
      </li>
    );
  };

  const SortableCard = ({ card }: { card: Card }) => {
    const { attributes, listeners, setNodeRef, transform, transition } =
      useSortable({ id: card.id });

    const style: CSSProperties = {
      ...css.card,
      transform: CSS.Transform.toString(transform),
      transition,
      touchAction: "none",
    };

    return (
      <Link
        ref={setNodeRef}
        to={`/cards/${card.id}`}
        {...attributes}
        {...listeners}
        style={style}
        className="app-card"
      >
        {card.image_url && <img src={imgSrc(card.image_url)} alt="" style={css.img} />}
        <h3 style={css.cardTitle}>{card.title}</h3>
        <p style={css.cardBody}>{card.body}</p>
      </Link>
    );
  };

  /* ======================================
     JSX
  ====================================== */
  if (loading || !folder) return <p style={{ padding: 40 }}>Loading…</p>;

  return (
    <div style={css.page}>
      {/* ===== サイドバー ===== */}
      <aside style={css.sidebar}>
        <button onClick={() => navigate(-1)} style={css.backBtn}>
          ← 戻る
        </button>

        <h2 style={css.sideHeading}>{folder.name}</h2>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={onDragEndFolders}
        >
          <SortableContext
            items={subfolders.map((f) => f.id)}
            strategy={verticalListSortingStrategy}
          >
            <ul style={css.sideList}>
              {subfolders.map((f) => (
                <SortableFolderRow key={f.id} folder={f} />
              ))}
            </ul>
          </SortableContext>
        </DndContext>

        <input
          style={css.sideInput}
          placeholder="新しいフォルダ名"
          value={newFolderName}
          onChange={(e) => setNewFolderName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addFolder()}
        />
        <button style={css.sideAddBtn} onClick={addFolder}>
          ＋ 作成
        </button>
      </aside>

      {/* ===== メインエリア ===== */}
      <main style={css.main}>
        <h1 style={css.mainHeading}>Cards</h1>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={onDragEndCards}
        >
          <SortableContext
            items={cards.map((c) => c.id)}
            strategy={horizontalListSortingStrategy}
          >
            <div style={css.grid}>
              {cards.map((c) => (
                <SortableCard key={c.id} card={c} />
              ))}
            </div>
          </SortableContext>
        </DndContext>

        {/* カード追加フォーム */}
        <section style={css.addCardBlock}>
          <h2 style={{ margin: "0 0 12px" }}>カード作成</h2>
          <input
            style={css.cardInput}
            placeholder="タイトル"
            value={newCardTitle}
            onChange={(e) => setNewCardTitle(e.target.value)}
          />
          <textarea
            style={{ ...css.cardInput, height: 80 }}
            placeholder="本文"
            value={newCardBody}
            onChange={(e) => setNewCardBody(e.target.value)}
          />
          <input
            type="file"
            accept="image/*"
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              if (e.target.files?.[0]) setNewCardImage(e.target.files[0]);
            }}
          />
          <button style={css.cardAddBtn} onClick={addCard}>
            ＋ 作成
          </button>
        </section>
      </main>
    </div>
  );
}

/* =========================================
   スタイル
========================================= */
const css: Record<string, CSSProperties> = {
  page: { display: "flex", height: "100vh" },

  /* ---- サイドバー ---- */
  sidebar: {
    width: 260,
    padding: "24px 16px",
    borderRight: "1px solid var(--border)",
    display: "flex",
    flexDirection: "column",
    gap: 16,
    overflowY: "auto",
  },
  backBtn: {
    border: "none",
    background: "transparent",
    color: "var(--fg)",
    fontSize: 16,
    cursor: "pointer",
    textAlign: "left",
    padding: 0,
  },
  sideHeading: { margin: "0 0 4px", fontSize: 18 },
  sideList: { listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column" },
  sideRow: {
    width: "100%",
    padding: "8px 12px",
    borderBottom: "1px solid var(--border)",
    userSelect: "none",
    cursor: "grab",
    transition: "background .15s",
  },
  sideLink: { color: "var(--card-fg)", textDecoration: "none", fontSize: 15 },
  sideInput: {
    width: "100%",
    padding: "6px 8px",
    borderRadius: 6,
    border: "1px solid var(--border)",
    background: "var(--card-bg)",
    color: "var(--fg)",
    fontSize: 14,
  },
  sideAddBtn: {
    border: "none",
    background: "var(--card-fg)",
    color: "#fff",
    padding: "6px 0",
    borderRadius: 6,
    cursor: "pointer",
    fontSize: 14,
  },

  /* ---- メイン ---- */
  main: { flex: 1, padding: 32, overflowY: "auto" },
  mainHeading: { margin: "0 0 24px", fontSize: 26 },
  grid: { display: "flex", flexWrap: "wrap", gap: 40 },

  /* ---- カード ---- */
  card: {
    width: 300,
    height: 240,
    background: "var(--card-bg)",
    border: "1px solid transparent",
    borderRadius: 16,
    boxShadow: `0 4px 8px var(--shadow)`,
    padding: 14,
    display: "flex",
    flexDirection: "column",
    gap: 8,
    textDecoration: "none",
  },
  img: {
    width: "100%",
    height: 150,
    objectFit: "cover",
    borderRadius: 10,
    pointerEvents: "none",
  },
  cardTitle: { margin: 0, fontSize: 16, fontWeight: 700 },
  cardBody: {
    margin: 0,
    fontSize: 13,
    color: "var(--fg-weak)",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },

  /* ---- カード作成 ---- */
  addCardBlock: { marginTop: 48, maxWidth: 420 },
  cardInput: {
    width: "100%",
    padding: "8px 10px",
    borderRadius: 8,
    border: "1px solid var(--border)",
    background: "var(--card-bg)",
    color: "var(--fg)",
    marginBottom: 10,
    fontSize: 14,
  },
  cardAddBtn: {
    marginTop: 6,
    padding: "6px 22px",
    border: "none",
    borderRadius: 8,
    background: "var(--card-fg)",
    color: "#fff",
    fontSize: 14,
    cursor: "pointer",
  },
};
