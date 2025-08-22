import { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable, type DropResult } from '@hello-pangea/dnd';
import { api } from '../services/api';
import { Plus, Pencil, Trash2, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

type List = { _id: string; name: string; position: number };
type Card = { _id: string; listId: string; title: string; position: number };
type Board = { _id: string; title: string };

export default function BoardView() {
  const { id: boardId } = useParams();
  const nav = useNavigate();

  const [board, setBoard] = useState<Board | null>(null);
  const [lists, setLists] = useState<List[]>([]);
  const [cards, setCards] = useState<Card[]>([]);
  const [newListName, setNewListName] = useState('');
  const [newCardTitle, setNewCardTitle] = useState<Record<string, string>>({});

  const sortedLists = useMemo(
    () => [...lists].sort((a, b) => a.position - b.position),
    [lists]
  );

  useEffect(() => {
    if (!boardId) return;
    Promise.all([
      api.get(`/boards/${boardId}`),          // { board }
      api.get(`/lists/board/${boardId}`),     // { lists }
      api.get(`/cards/board/${boardId}`),     // { cards }
    ])
      .then(([B, L, C]) => {
        setBoard(B.data.board);
        setLists(L.data.lists);
        setCards(C.data.cards);
      })
      .catch(() => toast.error('Failed to load board'));
  }, [boardId]);

  // ----- Board -----
  async function renameBoard() {
    if (!board) return;
    const next = prompt('Rename board:', board.title)?.trim();
    if (!next || next === board.title) return;
    try {
      const { data } = await api.patch(`/boards/${board._id}`, { title: next }); // -> { board }
      setBoard(data.board);
      toast.success('Board renamed');
    } catch {
      toast.error('Rename failed');
    }
  }

  async function deleteBoard() {
    if (!board) return;
    if (!confirm(`Delete board "${board.title}"? All lists and cards will be removed.`)) return;
    try {
      await api.delete(`/boards/${board._id}`);
      toast.success('Board deleted');
      nav('/boards', { replace: true });
    } catch {
      toast.error('Delete failed');
    }
  }

  // ----- Lists -----
  async function addList() {
    if (!newListName.trim() || !boardId) return;
    const nextPos = (Math.max(0, ...lists.map(l => l.position)) || 0) + 1000;
    try {
      const { data } = await api.post('/lists', {
        boardId,
        name: newListName.trim(),
        position: nextPos,
      }); // -> { list }
      setLists(prev => [...prev, data.list]);
      setNewListName('');
      toast.success('List added');
    } catch {
      toast.error('Failed to add list');
    }
  }

  async function renameList(listId: string, oldName: string) {
    const next = prompt('Rename list:', oldName)?.trim();
    if (!next || next === oldName) return;
    try {
      const { data } = await api.patch(`/lists/${listId}`, { name: next }); // -> { list }
      setLists(prev => prev.map(l => (l._id === listId ? data.list : l)));
      toast.success('List renamed');
    } catch {
      toast.error('Rename failed');
    }
  }

  async function deleteList(listId: string) {
    if (!confirm('Delete this list and its cards?')) return;
    try {
      await api.delete(`/lists/${listId}`);
      setLists(prev => prev.filter(l => l._id !== listId));
      setCards(prev => prev.filter(c => c.listId !== listId));
      toast.success('List deleted');
    } catch {
      toast.error('Delete failed');
    }
  }

  // ----- Cards -----
  async function addCard(listId: string) {
    const title = (newCardTitle[listId] || '').trim();
    if (!title || !boardId) return;
    const nextPos =
      (Math.max(0, ...cards.filter(c => c.listId === listId).map(c => c.position)) || 0) + 1000;

    try {
      const { data } = await api.post('/cards', { boardId, listId, title, position: nextPos }); // -> { card }
      setCards(prev => prev.concat(data.card));
      setNewCardTitle(prev => ({ ...prev, [listId]: '' }));
      toast.success('Card added');
    } catch {
      toast.error('Failed to add card');
    }
  }

  async function renameCard(cardId: string, oldTitle: string) {
    const next = prompt('Rename card:', oldTitle)?.trim();
    if (!next || next === oldTitle) return;
    try {
      const { data } = await api.patch(`/cards/${cardId}`, { title: next }); // -> { card }
      setCards(prev => prev.map(c => (c._id === cardId ? data.card : c)));
      toast.success('Card renamed');
    } catch {
      toast.error('Rename failed');
    }
  }

  async function deleteCard(cardId: string) {
    if (!confirm('Delete this card?')) return;
    try {
      await api.delete(`/cards/${cardId}`);
      setCards(prev => prev.filter(c => c._id !== cardId));
      toast.success('Card deleted');
    } catch {
      toast.error('Delete failed');
    }
  }

  // ----- Drag & drop -----
  async function onDragEnd(result: DropResult) {
    if (!result.destination) return;

    if (result.type === 'LIST') {
      const src = result.source.index, dst = result.destination.index;
      if (src === dst) return;

      const ordered = [...sortedLists];
      const [moved] = ordered.splice(src, 1);
      ordered.splice(dst, 0, moved);

      const items = ordered.map((l, i) => ({ listId: l._id, position: (i + 1) * 1000 }));
      setLists(ordered.map((l, i) => ({ ...l, position: (i + 1) * 1000 })));

      try {
        await api.patch('/lists/reorder', { boardId, items });
      } catch {
        try {
          const { data } = await api.get(`/lists/board/${boardId}`); // -> { lists }
          setLists(data.lists);
        } catch {}
        toast.error('Reorder failed');
      }
      return;
    }

    if (result.type === 'CARD') {
      const fromList = result.source.droppableId;
      const toList = result.destination.droppableId;
      const srcIdx = result.source.index;
      const dstIdx = result.destination.index;

      const byList = (lid: string) =>
        cards.filter(c => c.listId === lid).sort((a, b) => a.position - b.position);

      const fromCards = byList(fromList);
      const toCards = fromList === toList ? fromCards : byList(toList);

      const moved = fromCards[srcIdx];
      if (!moved) return;

      const newFrom = [...fromCards];
      newFrom.splice(srcIdx, 1);
      const newTo = fromList === toList ? [...newFrom] : [...toCards];
      const movedUpdated: Card = { ...moved, listId: toList };
      newTo.splice(dstIdx, 0, movedUpdated);

      const relabel = (arr: Card[]) => arr.map((c, i) => ({ ...c, position: (i + 1) * 1000 }));
      const updatedFrom = relabel(newFrom);
      const updatedTo = relabel(newTo);

      const newAll = cards
        .filter(c => c.listId !== fromList && c.listId !== toList)
        .concat(
          updatedFrom.map(c => ({ ...c, listId: fromList })),
          updatedTo.map(c => ({ ...c, listId: toList }))
        );

      setCards(newAll);

      const items = newAll.map(c => ({ cardId: c._id, listId: c.listId, position: c.position }));
      try {
        await api.patch('/cards/reorder', { boardId, items });
      } catch {
        try {
          const [{ data: L }, { data: C }] = await Promise.all([
            api.get(`/lists/board/${boardId}`),  // -> { lists }
            api.get(`/cards/board/${boardId}`),  // -> { cards }
          ]);
          setLists(L.lists);
          setCards(C.cards);
        } catch {}
        toast.error('Reorder failed');
      }
    }
  }

  const cardsFor = (listId: string) =>
    cards.filter(c => c.listId === listId).sort((a, b) => a.position - b.position);

  return (
    <div className="overflow-x-auto">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between reveal-up">
        <div className="flex items-center gap-3">
          <Link to="/boards" className="btn px-2" title="Back to boards">
            <ArrowLeft size={18} />
          </Link>
          <h1 className="text-2xl font-semibold">{board?.title || 'Board'}</h1>
          <button className="btn px-2" title="Rename board" onClick={renameBoard}>
            <Pencil size={16} />
          </button>
          <button className="btn px-2" title="Delete board" onClick={deleteBoard}>
            <Trash2 size={16} />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <input
            className="input max-w-xs"
            placeholder="New list name"
            value={newListName}
            onChange={(e) => setNewListName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addList()}
          />
          <button className="btn btn-primary" onClick={addList}>
            <Plus size={16} className="mr-1" /> Add List
          </button>
        </div>
      </div>

      {/* Lists / Cards */}
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="lists" direction="horizontal" type="LIST">
          {(provided) => (
            <div ref={provided.innerRef} {...provided.droppableProps} className="flex gap-4 pb-4">
              {sortedLists.map((l, idx) => (
                <Draggable draggableId={l._id} index={idx} key={l._id}>
                  {(p) => (
                    <div ref={p.innerRef} {...p.draggableProps}>
                      <div className="card w-80 p-3">
                        <div className="mb-2 flex items-center justify-between">
                          <div {...p.dragHandleProps} className="font-semibold">
                            {l.name}
                          </div>
                          <div className="flex gap-1">
                            <button
                              className="btn px-2"
                              title="Rename list"
                              onClick={() => renameList(l._id, l.name)}
                            >
                              <Pencil size={16} />
                            </button>
                            <button
                              className="btn px-2"
                              title="Delete list"
                              onClick={() => deleteList(l._id)}
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>

                        <Droppable droppableId={l._id} type="CARD">
                          {(dp) => (
                            <div ref={dp.innerRef} {...dp.droppableProps} className="min-h-[12px] space-y-2">
                              {cardsFor(l._id).map((c, cIdx) => (
                                <Draggable draggableId={c._id} index={cIdx} key={c._id}>
                                  {(cp) => (
                                    <div
                                      ref={cp.innerRef}
                                      {...cp.draggableProps}
                                      {...cp.dragHandleProps}
                                      className="flex items-center justify-between rounded-lg border border-slate-200/70 bg-white/90 p-2 shadow-sm transition hover:shadow-md dark:border-slate-800/70 dark:bg-slate-900/80"
                                    >
                                      <span
                                        className="truncate"
                                        onDoubleClick={() => renameCard(c._id, c.title)}
                                        title="Double-click to rename"
                                      >
                                        {c.title}
                                      </span>
                                      <button
                                        className="btn px-2"
                                        title="Delete card"
                                        onClick={() => deleteCard(c._id)}
                                      >
                                        <Trash2 size={16} />
                                      </button>
                                    </div>
                                  )}
                                </Draggable>
                              ))}
                              {dp.placeholder}
                            </div>
                          )}
                        </Droppable>

                        <div className="mt-3 flex gap-2">
                          <input
                            className="input flex-1"
                            placeholder="Add a card…"
                            value={newCardTitle[l._id] || ''}
                            onChange={(e) => setNewCardTitle(prev => ({ ...prev, [l._id]: e.target.value }))}
                            onKeyDown={(e) => e.key === 'Enter' && addCard(l._id)}
                          />
                          <button className="btn btn-primary" onClick={() => addCard(l._id)}>
                            Add
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </Draggable>
              ))}

              <button
                onClick={addList}
                className="grid w-80 place-items-center rounded-2xl border-2 border-dashed py-8 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
              >
                + Add List
              </button>

              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
}
