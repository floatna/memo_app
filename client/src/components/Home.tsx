import { useEffect, useState, type CSSProperties } from "react";
import { Link } from "react-router-dom";
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
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

/* ---------- 型 ---------- */
type Folder = { id: number; name: string };

/* ---------- Page ---------- */
export default function Home() {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [newName, setNewName] = useState("");
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [showInput, setShowInput] = useState(false);

  useEffect(() => {
    fetch("http://localhost:3000/api/folders")
      .then((r) => r.json())
      .then(setFolders);
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  const addFolder = () => {
    const name = newName.trim();
    if (!name) return;
    fetch("http://localhost:3000/folders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    })
      .then((r) => r.json())
      .then((created: Folder) => {
        setFolders((p) => [...p, created]);
        setNewName("");
        setShowInput(false);
      });
  };

  /* ---------- DnD ---------- */
  const sensors = useSensors(useSensor(PointerSensor));
  const onDragEnd = (ev: DragEndEvent) => {
    const { active, over } = ev;
    if (!over || active.id === over.id) return;
    const oldIdx = folders.findIndex((f) => f.id === active.id);
    const newIdx = folders.findIndex((f) => f.id === over.id);
    const ordered = arrayMove(folders, oldIdx, newIdx);
    setFolders(ordered);
    fetch("http://localhost:3000/folders/sort", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ order: ordered.map((f) => f.id) }),
    });
  };

  /* ---------- SortableCard ---------- */
  const SortableCard = ({ folder }: { folder: Folder }) => {
    const { attributes, listeners, setNodeRef, transform, transition } =
      useSortable({ id: folder.id });

    const style: CSSProperties = {
      ...css.card,
      transform: CSS.Transform.toString(transform),
      transition,
      touchAction: "none",
    };

    return (
      <Link
        ref={setNodeRef}
        to={`/folders/${folder.id}`}
        {...attributes}
        {...listeners}
        style={style}
        className="app-card"
      >
        <h3 style={css.cardTitle}>{folder.name}</h3>
      </Link>
    );
  };

  return (
    <div className="centered-page" style={css.page}>
      {/* overlay */}
      <div
        style={{
          ...css.overlay,
          opacity: showInput ? 1 : 0,
          pointerEvents: showInput ? "auto" : "none",
        }}
        onClick={() => setShowInput(false)}
      />

      {/* header */}
      <header style={css.header}>
        <h1 style={css.title}>📁 Folders</h1>
        <button
          style={css.themeBtn}
          onClick={() => setTheme((t) => (t === "light" ? "dark" : "light"))}
        >
          {theme === "light" ? "🌙" : "☀"}
        </button>
      </header>

      {/* grid */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={onDragEnd}
      >
        <SortableContext
          items={folders.map((f) => f.id)}
          strategy={horizontalListSortingStrategy}
        >
          <div style={css.grid}>
            {folders.map((f) => (
              <SortableCard key={f.id} folder={f} />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {/* add button & slide form */}
      <div style={css.formWrapper}>
        <button style={css.addBtn} onClick={() => setShowInput(true)}>
          ＋ 作成
        </button>

        <div
          style={{
            ...css.inputArea,
            transform: showInput ? "translateY(0)" : "translateY(-10px)",
            maxHeight: showInput ? 80 : 0,
            opacity: showInput ? 1 : 0,
          }}
        >
          <input
            style={css.input}
            placeholder="新しいフォルダ名"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addFolder()}
            autoFocus={showInput}
          />
          <button style={css.inputAddBtn} onClick={addFolder}>
            追加
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------- Styles ---------- */
const css: Record<string, CSSProperties> = {
  page: { position: "relative", display: "flex", flexDirection: "column", gap: 36, padding: 40 },
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.35)",
    backdropFilter: "blur(1px)",
    transition: "opacity .25s ease",
    zIndex: 5,
  },
  header: { display: "flex", gap: 16, alignItems: "center" },
  title: { margin: 0, fontSize: 40 },
  themeBtn: {
    border: "none",
    background: "var(--card-bg)",
    padding: "6px 12px",
    borderRadius: 6,
    cursor: "pointer",
  },
  grid: {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 32,
    maxWidth: 1100,
  },
  card: {
    width: 240,
    height: 110,
    background: "var(--card-bg)",
    border: "1px solid transparent",
    borderRadius: 12,
    boxShadow: `0 3px 6px var(--shadow)`,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    textDecoration: "none",
  },
  cardTitle: { margin: 0, fontSize: 18, fontWeight: 600 },

  /* slide form */
  formWrapper: { position: "relative", zIndex: 10, display: "flex", flexDirection: "column", alignItems: "center", gap: 10 },
  addBtn: {
    padding: "0.6em 1.4em",
    borderRadius: 8,
    border: "none",
    background: "var(--card-fg)",
    color: "#fff",
    fontSize: 16,
    cursor: "pointer",
  },
  inputArea: {
    display: "flex",
    gap: 10,
    overflow: "hidden",
    transition: "max-height .25s ease, opacity .25s ease, transform .25s ease",
  },
  input: {
    width: 240,
    padding: "10px 12px",
    border: "1px solid var(--border)",
    borderRadius: 8,
    background: "var(--card-bg)",
    color: "var(--fg)",
    fontSize: 14,
  },
  inputAddBtn: {
    padding: "0 22px",
    border: "none",
    borderRadius: 8,
    background: "var(--card-fg)",
    color: "#fff",
    cursor: "pointer",
  },
};
