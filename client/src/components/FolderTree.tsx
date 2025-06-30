// client/src/components/FolderTree.tsx
import { useEffect, useState } from "react";

type Card = {
    id: number;
    title: string;
    body: string;
};

type Folder = {
    id: number;
    name: string;
    parent_id: number | null;
    cards: Card[];
    children: Folder[];
};

function FolderItem({ folder }: { folder: Folder }) {
    return (
        <li style={{ marginLeft: "1rem", marginTop: "1rem" }}>
            <details open>
                <summary><strong>{folder.name}</strong></summary>
                <ul style={{ marginLeft: "1rem" }}>
                    {folder.cards.map((card) => (
                        <li key={card.id}>
                            📝 {card.title}: {card.body}
                        </li>
                    ))}
                    {(folder.children || []).map((child) => (
                        <FolderItem key={child.id} folder={child} />
                    ))}

                </ul>
            </details>
        </li>
    );
}

export default function FolderTree() {
    const [folders, setFolders] = useState<Folder[]>([]);

    useEffect(() => {
        fetch("http://localhost:3000/api/folders")
            .then((res) => res.json())
            .then((data) => setFolders(data))
            .catch((err) => console.error("API error:", err));
    }, []);

    return (
        <div style={{ padding: "1rem", maxWidth: "800px", margin: "0 auto" }}>
            <h1>フォルダ構造とカード一覧</h1>
            <ul>
                {folders.map((folder) => (
                    <FolderItem key={folder.id} folder={folder} />
                ))}
            </ul>
        </div>
    );
}
