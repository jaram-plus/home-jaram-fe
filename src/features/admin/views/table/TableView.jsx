import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { SCHEMAS, PEOPLE_TABS, RESOURCES, TOAST, MESSAGES } from '../../admin.data';
import { useAdminStore, dirtyCount, mergeRows } from '../../admin.store';
import { useResourceList, useBatchSave, useDriveExport } from '../../admin.queries';
import { TableToolbar } from './TableToolbar';
import { DataTable } from './DataTable';
import { Pagination } from './Pagination';
import { SaveBar } from './SaveBar';
import { EmptyState } from './EmptyState';

const PAGE_SIZE = 8;

/**
 * 리소스 표 화면 — 인원(회원/임원진/기여자/졸업생 탭)·세미나·스터디·가입신청 공용.
 * 검색·필터·정렬·페이지는 URL searchParams 로, 인라인 편집·선택·추가/삭제는 zustand
 * 스토어로 관리합니다. 변경분이 있으면 하단 스티키 저장바가 나타나고, 일괄 저장은
 * PATCH …:batch 한 번으로 커밋됩니다. (기획.md §3·§8)
 *
 * @param resource 고정 리소스('seminars'|'studies'|'applications'). 인원 관리는 생략 →
 *                 ?tab= 로 member|exec|contrib|graduate 를 고릅니다.
 */
export function TableView({ resource: fixedResource }) {
  const [sp, setSp] = useSearchParams();
  const tab = sp.get('tab') || 'member';
  const resource = fixedResource || tab;
  const schema = SCHEMAS[resource];
  const isPeople = !fixedResource;

  /* ── URL 파생 파라미터 ─────────────────────────────────────── */
  const q = sp.get('q') || '';
  const sort = sp.get('sort') || '';
  const page = Math.max(1, parseInt(sp.get('page') || '1', 10));
  const filters = {};
  (schema.filters || []).forEach((f) => {
    const v = sp.get(f.key);
    if (v) filters[f.key] = v;
  });
  const params = { q, sort, page, size: PAGE_SIZE, filters };

  const patch = (obj, { resetPage } = {}) => {
    const next = new URLSearchParams(sp);
    Object.entries(obj).forEach(([k, v]) => {
      if (v == null || v === '' || v === '전체') next.delete(k);
      else next.set(k, String(v));
    });
    if (resetPage) next.set('page', '1');
    setSp(next, { replace: true });
  };

  /* ── 서버 상태 ─────────────────────────────────────────────── */
  const { data, isLoading, isFetching } = useResourceList(resource, params);
  const items = data?.items || [];
  const total = data?.total ?? 0;
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const origById = React.useMemo(() => Object.fromEntries(items.map((r) => [r.id, r])), [items]);

  // 임원진 탭의 '대조' 컬럼용 회원 명부 인덱스(학번 → 회원). exec 일 때만 조회.
  const roster = useResourceList('member', { size: 200, page: 1 }, { enabled: resource === 'exec' });
  const memberIndex = React.useMemo(() => {
    const map = {};
    (roster.data?.items || []).forEach((m) => { map[String(m.studentId).trim()] = m; });
    return map;
  }, [roster.data]);

  /* ── 로컬 편집 상태 ────────────────────────────────────────── */
  const slice = useAdminStore((s) => s.byResource[resource]);
  const setEdit = useAdminStore((s) => s.setEdit);
  const setCreateField = useAdminStore((s) => s.setCreateField);
  const dropCreate = useAdminStore((s) => s.dropCreate);
  const addRow = useAdminStore((s) => s.addRow);
  const toggleDelete = useAdminStore((s) => s.toggleDelete);
  const toggleSelect = useAdminStore((s) => s.toggleSelect);
  const toggleAll = useAdminStore((s) => s.toggleAll);
  const applySaved = useAdminStore((s) => s.applySaved);
  const reset = useAdminStore((s) => s.reset);
  const showToast = useAdminStore((s) => s.showToast);

  const rows = mergeRows(items, slice);
  const dcount = dirtyCount(slice);
  const visibleIds = rows.map((r) => r.id);
  const allSelected = visibleIds.length > 0 && visibleIds.every((id) => slice?.selected?.[id]);

  /* ── 셀/행 핸들러 ──────────────────────────────────────────── */
  const onCellChange = (row, col, value) => {
    if (row._new) setCreateField(resource, row.id, col.key, value);
    else setEdit(resource, row.id, col.key, value, origById[row.id]?.[col.key]);
  };

  const onAction = (kind, row) => {
    if (kind === 'delete') {
      if (row._new) dropCreate(resource, row.id);
      else toggleDelete(resource, row.id);
    } else if (kind === 'approve') {
      // 저장 시 회원으로 편입 (staged). 즉시 편입을 원하면 useApproveApplication 로 교체.
      setEdit(resource, row.id, 'status', '승인', origById[row.id]?.status);
      showToast(TOAST.approved);
    } else if (kind === 'reject') {
      setEdit(resource, row.id, 'status', '반려', origById[row.id]?.status);
      showToast(TOAST.rejected);
    }
  };

  const onAddRow = () => {
    const fields = {};
    schema.cols.forEach((c) => {
      if (c.type === 'actions' || c.type === 'match') return;
      if (c.type === 'select') fields[c.key] = c.options[0];
      else if (c.type === 'tag') fields[c.key] = '대기';
      else fields[c.key] = '';
    });
    addRow(resource, fields);
  };

  /* ── 저장 / 되돌리기 ───────────────────────────────────────── */
  const save = useBatchSave(resource, {
    onSuccess: () => {
      applySaved(resource);
      showToast(TOAST.saved(dcount));
    },
    onError: () => showToast(MESSAGES.savePartialFail),
  });

  const onSave = () => {
    if (!slice || dcount === 0) return;
    const updates = Object.entries(slice.edits).map(([id, fields]) => ({ id, fields, version: origById[id]?.updatedAt }));
    const creates = slice.creates.map(({ id, _new, ...fields }) => ({ tempId: id, fields }));
    const deletes = Object.keys(slice.deletes);
    save.mutate({ updates, creates, deletes });
  };

  /* ── 내보내기 ──────────────────────────────────────────────── */
  const drive = useDriveExport(resource, { onSuccess: () => showToast(TOAST.exported) });
  const onExport = () => drive.mutate({ filters });

  /* ── 정렬 토글 ─────────────────────────────────────────────── */
  const onSort = (key) => {
    const [curKey, curDir] = sort.split(',');
    const dir = curKey === key && curDir === 'asc' ? 'desc' : 'asc';
    patch({ sort: `${key},${dir}` });
  };

  const unit = RESOURCES[resource]?.unit || '건';
  const empty = !isLoading && rows.length === 0;

  return (
    <div>
      <p style={{ margin: '0 0 10px', fontSize: 12, fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--brand)' }}>{schema.eyebrow}</p>
      <h1 style={{ margin: '0 0 6px', fontFamily: 'var(--font-display)', fontSize: 40, lineHeight: 1.1, color: 'var(--text-strong)' }}>{schema.title}</h1>
      <p style={{ margin: '0 0 20px', fontSize: 15, color: 'var(--text-muted)' }}>{schema.desc}</p>

      {isPeople && (
        <div style={{ display: 'flex', gap: 28, borderBottom: '1px solid var(--border)', marginBottom: 20 }}>
          {PEOPLE_TABS.map((t) => {
            const active = tab === t.key;
            return (
              <button
                key={t.key}
                type="button"
                onClick={() => patch({ tab: t.key, sort: '', q: '' }, { resetPage: true })}
                style={{ padding: '10px 2px', border: 'none', background: 'transparent', cursor: 'pointer', fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-body)', fontWeight: 600, color: active ? 'var(--brand)' : 'var(--text-muted)', borderBottom: active ? '2px solid var(--brand)' : '2px solid transparent', marginBottom: -1 }}
              >
                {t.label}
              </button>
            );
          })}
        </div>
      )}

      <TableToolbar
        schema={schema}
        q={q}
        filters={filters}
        onSearch={(v) => patch({ q: v }, { resetPage: true })}
        onFilter={(key, v) => patch({ [key]: v }, { resetPage: true })}
        onExport={onExport}
        onAddRow={onAddRow}
        exporting={drive.isPending}
      />

      <DataTable
        schema={schema}
        rows={rows}
        sort={sort}
        loading={isLoading}
        allSelected={allSelected}
        selected={slice?.selected || {}}
        onToggleAll={() => toggleAll(resource, visibleIds)}
        onToggleSelect={(id) => toggleSelect(resource, id)}
        onSort={onSort}
        onCellChange={onCellChange}
        onAction={onAction}
        memberIndex={memberIndex}
      />

      {empty && <EmptyState searching={!!q || Object.keys(filters).length > 0} />}

      <Pagination
        page={page}
        pageCount={pageCount}
        total={total}
        unit={unit}
        dirty={dcount > 0}
        busy={isFetching}
        onPrev={() => patch({ page: Math.max(1, page - 1) })}
        onNext={() => patch({ page: Math.min(pageCount, page + 1) })}
      />

      <SaveBar count={dcount} saving={save.isPending} onSave={onSave} onCancel={() => reset(resource)} />
    </div>
  );
}
