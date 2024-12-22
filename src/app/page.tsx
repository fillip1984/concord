"use client";

import Link from "next/link";
import {
  type Dispatch,
  type FormEvent,
  type SetStateAction,
  useEffect,
  useState,
} from "react";
import { FaPencil, FaPlus, FaTrash } from "react-icons/fa6";
import { IoIosClose } from "react-icons/io";
import { api } from "~/trpc/react";
import { type BoardSummaryType } from "~/trpc/types";

export default function Home() {
  const { data: boards } = api.board.readAll.useQuery();
  const [boardToEdit, setBoardToEdit] = useState<BoardSummaryType | null>(null);
  const handleAddBoard = () => {
    setBoardToEdit({ id: "new", name: "", description: "" });
  };

  return (
    <>
      <div className="p-4">
        <h3>Boards</h3>
        <div className="flex gap-4">
          <div className="flex gap-2">
            {boards?.map((board) => (
              <BoardCard
                key={board.id}
                board={board}
                setBoardToEdit={setBoardToEdit}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={handleAddBoard}
            className="flex min-h-[200px] flex-col items-center justify-center rounded-xl border p-4 text-2xl">
            New Board <FaPlus />
          </button>
        </div>
      </div>

      {boardToEdit !== null && (
        <BoardDetailsModal
          board={boardToEdit}
          setBoardToEdit={setBoardToEdit}
        />
      )}
    </>
  );
}

const BoardCard = ({
  board,
  setBoardToEdit,
}: {
  board: BoardSummaryType;
  setBoardToEdit: Dispatch<SetStateAction<BoardSummaryType | null>>;
}) => {
  const utils = api.useUtils();
  const { mutate: deleteBoard } = api.board.delete.useMutation({
    onSuccess: async () => {
      await utils.board.invalidate();
    },
  });
  const handleDeleteBoard = () => {
    deleteBoard({ id: board.id });
  };

  return (
    <Link
      href={`/boards/${board.id}`}
      className="flex min-h-[200px] min-w-[350px] rounded-xl border p-2">
      <div className="flex flex-1 flex-col justify-between">
        <div>
          <h4>{board.name}</h4>
          <p className="text-gray-500">{board.description}</p>
        </div>
        <div className="flex justify-end gap-2 p-2">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setBoardToEdit(board);
            }}>
            <FaPencil className="text-gray-600" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleDeleteBoard();
            }}>
            <FaTrash className="text-red-400" />
          </button>
        </div>
      </div>
    </Link>
  );
};

const BoardDetailsModal = ({
  board,
  setBoardToEdit,
}: {
  board: BoardSummaryType;
  setBoardToEdit: Dispatch<SetStateAction<BoardSummaryType | null>>;
}) => {
  const [id, setId] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    setId(board.id);
    setName(board.name);
    setDescription(board.description);
  }, [board]);

  const utils = api.useUtils();
  const { mutate: createBoard } = api.board.create.useMutation({
    onSuccess: async () => {
      void utils.board.invalidate();
      setBoardToEdit(null);
    },
  });
  const { mutate: updateBoard } = api.board.update.useMutation({
    onSuccess: async () => {
      void utils.board.invalidate();
      setBoardToEdit(null);
    },
  });

  const handleSave = (e: FormEvent) => {
    e.preventDefault();
    if (id === "new") {
      createBoard({ name, description });
    } else {
      updateBoard({
        id: board.id,
        name,
        description,
      });
    }
  };

  return (
    <div className="absolute inset-0 flex items-center justify-center">
      {/* Backdrop */}
      <div
        onClick={() => setBoardToEdit(null)}
        className="absolute inset-0 z-[999] bg-black/30 backdrop-blur"></div>

      {/* Modal Container */}
      <div className="z-[1000] min-h-[400px] w-1/2 rounded-lg bg-stone-700">
        {/* Modal toolbar */}
        <div className="flex justify-end">
          <button type="button" onClick={() => setBoardToEdit(null)}>
            <IoIosClose className="text-4xl" />
          </button>
        </div>

        {/* Modal body */}
        <form onSubmit={handleSave} className="flex flex-col gap-2 p-4">
          <div className="flex flex-col gap-2">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Name..."
            />
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description..."
            />
          </div>

          <div>
            <button
              type="submit"
              className="rounded bg-orange-400 px-4 py-2 text-2xl"
              disabled={!name || !description}>
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
