import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { departmentKey, titleLabel } from '@/shared/member/enums';
import { useAuthStore } from '@/shared/auth/auth.store';
import { SCHEMAS, PEOPLE_TABS, RESOURCES, TOAST, MESSAGES } from '../../admin.data';
import { useAdminStore, dirtyCount, mergeRows } from '../../admin.store';
import { canAssign, grantsOf, titleOptions } from '../../exec.roles';
import { useResourceList, useBatchSave, useDriveExport, useMemberDetail } from '../../admin.queries';
import { TableToolbar } from './TableToolbar';
import { DataTable } from './DataTable';
import { Pagination } from './Pagination';
import { SaveBar } from './SaveBar';
import { EmptyState } from './EmptyState';
import { ConfirmDialog } from '../forms/ConfirmDialog';
import { MemberDetailModal } from '../forms/MemberDetailModal';
import { SeminarDetailModal } from '../forms/SeminarDetailModal';
import { SeminarCreateModal } from '../forms/SeminarCreateModal';
import { GradDetailModal } from '../forms/GradDetailModal';
import { ExecAssignModal } from '../forms/ExecAssignModal';
import { ContribAddModal } from '../forms/ContribAddModal';

const PAGE_SIZE = 8;

/**
 * 리소스 표 화면 — 인원(회원/임원진/기여자/졸업생 탭)·세미나·스터디·가입신청 공용.
 * 검색·필터·정렬·페이지는 URL searchParams 로, 인라인 편집·선택·추가/삭제는 zustand
 * 스토어로 관리합니다. 변경분이 있으면 하단 스티키 저장바가 나타나고, 일괄 저장은
 * PATCH …:batch 한 번으로 커밋됩니다. (기획.md §3·§8)
 *
 * @param resource 고정 리소스('seminars'|'studies'|'applications'). 인원 관리는 생략 →
 *                 ?tab= 로 member|exec|contrib|grad 를 고릅니다.
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
  const items = React.useMemo(() => data?.items || [], [data]);
  const total = data?.total ?? 0;
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const origById = React.useMemo(() => Object.fromEntries(items.map((r) => [r.id, r])), [items]);

  /* 임원 지정 권한 — 로그인한 임원의 현직 부서·직책으로 판정한다(exec 탭에서만 조회).
   * 서버는 (부서, 직책) 조합만 검증하고 "누가 줄 수 있는가"는 보지 않으므로, 이 판정이
   * 화면에서의 유일한 관문이다. */
  const authUser = useAuthStore((s) => s.user);
  const { data: me } = useMemberDetail(authUser?.id, { enabled: resource === 'exec' && !!authUser?.id });
  const grants = React.useMemo(() => (resource === 'exec' ? grantsOf(me) : {}), [resource, me]);

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
    // 부서를 바꾸면 이전 직책이 그 부서에서 허용되지 않을 수 있다 — 함께 맞춰 준다.
    if (resource === 'exec' && col.key === 'department') {
      const next = titleOptions(grants, departmentKey(value))[0];
      setEdit(resource, row.id, 'title', titleLabel(next, departmentKey(value)) ?? '', origById[row.id]?.title);
    }
  };

  /* 상세 모달은 URL(?detail=)로 연다 — 뒤로가기로 닫히고, 링크로 그 행을 바로 열 수 있다.
   * 표의 편집 상태와는 무관하다. 행이 목록에서 사라지면(삭제·필터) 모달도 함께 닫힌다. */
  const detailRow = React.useMemo(() => {
    const id = sp.get('detail');
    return id ? rows.find((r) => r.id === id) : null;
  }, [sp, rows]);
  const openDetail = (id) => {
    const next = new URLSearchParams(sp);
    next.set('detail', id);
    setSp(next); // push — 뒤로가기 한 번이면 닫힌다
  };
  const closeDetail = () => {
    const next = new URLSearchParams(sp);
    next.delete('detail');
    setSp(next, { replace: true });
  };

  const [assigning, setAssigning] = React.useState(false);
  const [addingContrib, setAddingContrib] = React.useState(false);
  const [creatingSeminar, setCreatingSeminar] = React.useState(false);

  const onAction = (kind, row) => {
    if (kind === 'detail') {
      openDetail(row.id);
    } else if (kind === 'unassign') {
      // 임원진 표의 '삭제'는 회원 삭제가 아니라 임기 해제다 — 부서·직책을 비워 저장한다.
      // 이미 비워 둔 행이면 원래 값으로 되돌린다.
      const orig = origById[row.id] || {};
      const clearing = !!row.title;
      setEdit(resource, row.id, 'department', clearing ? '' : orig.department, orig.department);
      setEdit(resource, row.id, 'title', clearing ? '' : orig.title, orig.title);
    } else if (kind === 'uncontrib') {
      // 기여자 표의 '해제'는 회원 삭제가 아니라 기여자 플래그 내리기다.
      // 이미 내려 둔 행이면 원래 값으로 되돌린다(setEdit 이 편집분을 지운다).
      const orig = origById[row.id] || {};
      setEdit(resource, row.id, 'contributor', row.contributor === false ? orig.contributor : false, orig.contributor);
    } else if (kind === 'delete') {
      if (row._new) dropCreate(resource, row.id);
      else toggleDelete(resource, row.id);
    } else if (kind === 'approve') {
      // 저장 시 회원으로 편입 (staged). 즉시 편입을 원하면 useApproveApplication 로 교체.
      setEdit(resource, row.id, 'status', '승인', origById[row.id]?.status);
      showToast(resource === 'seminarApprovals' ? TOAST.seminarApproved : TOAST.approved);
    } else if (kind === 'reject') {
      setEdit(resource, row.id, 'status', '반려', origById[row.id]?.status);
      showToast(resource === 'seminarApprovals' ? TOAST.seminarRejected : TOAST.rejected);
    }
  };

  const onAddRow = () => {
    // 임원진은 회원 명부에서 골라 임명하는 것이지 표에 빈 행을 만드는 게 아니다.
    if (resource === 'exec') { setAssigning(true); return; }
    // 기여자도 회원 명부에서 골라 등록한다 — 표에 빈 행을 만드는 게 아니다.
    if (resource === 'contrib') { setAddingContrib(true); return; }
    // 세미나 표는 읽기 전용이라 빈 행을 채울 수 없다 — 개설 모달에서 받아 바로 만든다.
    if (resource === 'seminars') { setCreatingSeminar(true); return; }
    const fields = {};
    schema.cols.forEach((c) => {
      if (c.type === 'actions' || c.type === 'match') return;
      if (c.type === 'select') fields[c.key] = c.options[0];
      else if (c.type === 'tag') fields[c.key] = '대기';
      else if (c.type === 'multiselect') fields[c.key] = [];
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

  // 졸업생 전환은 진행 중인 임원 임기를 종료시킨다. 되돌릴 수 없으므로 저장 전에 확인을 받는다.
  const [graduating, setGraduating] = React.useState(null);

  const onSave = () => {
    if (!slice || dcount === 0) return;
    // version 은 서버 행의 낙관적 잠금 값(AdminBatchRequest.Update.version). 빠뜨리면
    // 서버가 충돌 검사를 건너뛰어 남의 수정을 덮어쓴다.
    const updates = Object.entries(slice.edits).map(([id, fields]) => ({ id, fields, version: origById[id]?.version }));
    const creates = slice.creates.map(({ id, _new, ...fields }) => ({ tempId: id, fields }));
    const deletes = Object.keys(slice.deletes);

    const ending = updates.filter((u) => u.fields.grade === '졸업생' && origById[u.id]?.title);
    if (ending.length) {
      setGraduating({ count: ending.length, payload: { updates, creates, deletes } });
      return;
    }
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
  // 지정 권한이 없는 임원에게는 '임원 지정' 버튼 자체를 내주지 않는다.
  const toolbarSchema = resource === 'exec' && !canAssign(grants) ? { ...schema, addLabel: '' } : schema;

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
        schema={toolbarSchema}
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
        grants={grants}
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

      {graduating && (
        <ConfirmDialog
          title="졸업생으로 변경할까요?"
          message={MESSAGES.confirmGraduate(graduating.count)}
          confirmLabel="변경하고 저장"
          onConfirm={() => { save.mutate(graduating.payload); setGraduating(null); }}
          onCancel={() => setGraduating(null)}
        />
      )}

      {/* 졸업생 상세는 조회 전용이 아니라 졸업연도·이력을 고치는 자리라 모달이 따로다. */}
      {detailRow && (resource === 'seminars'
        ? <SeminarDetailModal row={detailRow} onClose={closeDetail} onDone={showToast} />
        : resource === 'grad'
          ? <GradDetailModal row={detailRow} onClose={closeDetail} onDone={showToast} />
          : <MemberDetailModal row={detailRow} onClose={closeDetail} />)}

      {assigning && (
        <ExecAssignModal
          grants={grants}
          me={me}
          onClose={() => setAssigning(false)}
          onDone={showToast}
        />
      )}

      {addingContrib && (
        <ContribAddModal
          onClose={() => setAddingContrib(false)}
          onDone={showToast}
        />
      )}

      {creatingSeminar && (
        <SeminarCreateModal
          onClose={() => setCreatingSeminar(false)}
          onDone={showToast}
        />
      )}
    </div>
  );
}
