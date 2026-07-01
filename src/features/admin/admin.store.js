/**
 * admin 로컬 UI 스토어 (zustand) — 서버 상태(TanStack Query)와 분리된 "편집 중" 상태.
 *
 * 리소스별로 다음을 보관합니다.
 *   edits   : { [rowId]: { [field]: newValue } }  기존 행의 셀 변경분
 *   creates : Row[]                                추가된 임시 행(_tempId 보유, 미저장)
 *   deletes : { [rowId]: true }                    삭제 예약된 기존 행
 *   selected: { [rowId]: true }                    체크박스 선택
 *
 * DataTable/EditableCell/SaveBar 가 이 스토어를 구독합니다. 저장 성공(useBatchSave)
 * 시 applySaved 로 해당 리소스의 편집분을 비우고, 쿼리를 invalidate 해 서버 값으로
 * 다시 채웁니다. (DEVELOPMENT.md §5 · 기획.md §8)
 */
import { create } from 'zustand';

const blank = () => ({ edits: {}, creates: [], deletes: {}, selected: {} });
const tempId = () => 'tmp-' + Math.random().toString(36).slice(2, 9);

export const useAdminStore = create((set, get) => ({
  byResource: {},
  toast: null,

  slice(resource) {
    return get().byResource[resource] || blank();
  },

  _patch(resource, partial) {
    set((s) => {
      const cur = s.byResource[resource] || blank();
      return { byResource: { ...s.byResource, [resource]: { ...cur, ...partial } } };
    });
  },

  /* ── 인라인 편집 ─────────────────────────────────────────────── */
  setEdit(resource, id, field, value, original) {
    const cur = get().slice(resource);
    const rowEdits = { ...(cur.edits[id] || {}) };
    if (String(value) === String(original ?? '')) delete rowEdits[field];
    else rowEdits[field] = value;
    const edits = { ...cur.edits };
    if (Object.keys(rowEdits).length) edits[id] = rowEdits;
    else delete edits[id];
    get()._patch(resource, { edits });
  },

  /* ── 행 추가 (임시행) ───────────────────────────────────────── */
  addRow(resource, fields) {
    const cur = get().slice(resource);
    const row = { id: tempId(), _new: true, ...fields };
    get()._patch(resource, { creates: [row, ...cur.creates] });
    return row.id;
  },
  setCreateField(resource, tempRowId, field, value) {
    const cur = get().slice(resource);
    const creates = cur.creates.map((r) => (r.id === tempRowId ? { ...r, [field]: value } : r));
    get()._patch(resource, { creates });
  },
  dropCreate(resource, tempRowId) {
    const cur = get().slice(resource);
    get()._patch(resource, { creates: cur.creates.filter((r) => r.id !== tempRowId) });
  },

  /* ── 삭제 예약 / 선택 ───────────────────────────────────────── */
  toggleDelete(resource, id) {
    const cur = get().slice(resource);
    const deletes = { ...cur.deletes };
    if (deletes[id]) delete deletes[id];
    else deletes[id] = true;
    get()._patch(resource, { deletes });
  },
  toggleSelect(resource, id) {
    const cur = get().slice(resource);
    const selected = { ...cur.selected };
    if (selected[id]) delete selected[id];
    else selected[id] = true;
    get()._patch(resource, { selected });
  },
  toggleAll(resource, ids) {
    const cur = get().slice(resource);
    const all = ids.length > 0 && ids.every((id) => cur.selected[id]);
    const selected = { ...cur.selected };
    ids.forEach((id) => {
      if (all) delete selected[id];
      else selected[id] = true;
    });
    get()._patch(resource, { selected });
  },
  /** 선택된 행을 삭제 예약(기존행) 하거나 임시행이면 즉시 제거. */
  deleteSelected(resource) {
    const cur = get().slice(resource);
    const selIds = Object.keys(cur.selected);
    if (!selIds.length) return;
    const tempSet = new Set(cur.creates.map((r) => r.id));
    const deletes = { ...cur.deletes };
    selIds.forEach((id) => {
      if (!tempSet.has(id)) deletes[id] = true;
    });
    get()._patch(resource, {
      deletes,
      creates: cur.creates.filter((r) => !cur.selected[r.id]),
      selected: {},
    });
  },

  /* ── 저장 / 되돌리기 ────────────────────────────────────────── */
  applySaved(resource) {
    get()._patch(resource, blank());
  },
  reset(resource) {
    get()._patch(resource, blank());
  },

  /* ── 토스트 ─────────────────────────────────────────────────── */
  showToast(msg) {
    set({ toast: msg });
    clearTimeout(get()._toastTimer);
    const t = setTimeout(() => set({ toast: null }), 2600);
    set({ _toastTimer: t });
  },
}));

/* ── 파생 셀렉터 (컴포넌트에서 useAdminStore(selector) 로 구독) ───────── */

/** 리소스의 변경 건수 = 편집된 기존행 + 추가행 + 삭제행. */
export function dirtyCount(slice) {
  if (!slice) return 0;
  return Object.keys(slice.edits).length + slice.creates.length + Object.keys(slice.deletes).length;
}

/**
 * 서버 items + 로컬 편집분을 병합해 화면에 그릴 행 목록을 만듭니다.
 * - creates 를 상단에 얹고
 * - deletes 예약행은 _pendingDelete 플래그를 달아 그대로 두며(취소 가능)
 * - edits 오버레이를 각 셀 값에 반영합니다.
 */
export function mergeRows(items, slice) {
  const s = slice || blank();
  const existing = (items || []).map((row) => {
    const e = s.edits[row.id];
    const merged = e ? { ...row, ...e } : row;
    return { ...merged, _dirtyFields: e ? Object.keys(e) : [], _pendingDelete: !!s.deletes[row.id] };
  });
  const created = s.creates.map((row) => ({ ...row, _new: true, _dirtyFields: [] }));
  return [...created, ...existing];
}
