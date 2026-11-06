"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import type { Company, CompanySort } from "@/lib/companies/types";
import type { Dictionary } from "@/lib/i18n/dictionary";
import { SortIcon } from "@/components/icons";
import { TableSkeletonRows } from "@/components/skeleton";

type CompanyTableProps = {
  items: readonly Company[] | undefined;
  sort: CompanySort;
  selectedId: string | null;
  offset: number;
  isPending: boolean;
  isFetching: boolean;
  isError: boolean;
  labels: Dictionary;
  formatDate: (iso: string) => string;
  onSort: (column: "name" | "created_at") => void;
  onOpen: (id: string) => void;
  onRetry: () => void;
};

function ariaSort(sort: CompanySort, column: "name" | "created_at"): "ascending" | "descending" | "none" {
  if (column === "name") {
    if (sort === "name") return "ascending";
    if (sort === "-name") return "descending";
    return "none";
  }
  if (sort === "created_at") return "ascending";
  if (sort === "-created_at") return "descending";
  return "none";
}

export function CompanyTable({
  items,
  sort,
  selectedId,
  offset,
  isPending,
  isFetching,
  isError,
  labels,
  formatDate,
  onSort,
  onOpen,
  onRetry,
}: CompanyTableProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const skipInitialScroll = useRef(true);
  const showFetchShimmer = isFetching && !isPending;

  useEffect(() => {
    if (skipInitialScroll.current) {
      skipInitialScroll.current = false;
      return;
    }
    scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, [offset]);

  return (
    <div className="table-card">
      <h2 id="companies-table-title" className="table-card-title">{labels.appTitle}</h2>
      {isPending ? (
        <p className="sr-only" role="status">
          {labels.loading}
        </p>
      ) : null}
      <div ref={scrollRef} className={showFetchShimmer ? "table-scroll is-fetching" : "table-scroll"}>
        <table className="data-table" aria-busy={isFetching} aria-labelledby="companies-table-title">
          <thead>
            <tr>
              <th scope="col" className="col-index">
                <span className="sr-only">#</span>
              </th>
              <th scope="col" aria-sort={ariaSort(sort, "name")}>
                <button type="button" className="sort-button" aria-label={labels.sortByName} onClick={() => onSort("name")}>
                  {labels.name}
                  <SortIcon direction={ariaSort(sort, "name")} />
                </button>
              </th>
              <th scope="col">{labels.domain}</th>
              <th scope="col">{labels.statusLabel}</th>
              <th scope="col" aria-sort={ariaSort(sort, "created_at")}>
                <button
                  type="button"
                  className="sort-button"
                  aria-label={labels.sortByCreated}
                  onClick={() => onSort("created_at")}
                >
                  {labels.created}
                  <SortIcon direction={ariaSort(sort, "created_at")} />
                </button>
              </th>
            </tr>
          </thead>
          <tbody>
            {isPending ? <TableSkeletonRows /> : null}
            {!isPending && isError ? (
              <tr>
                <td colSpan={5} className="table-message">
                  <p role="alert" className="banner-error">
                    {labels.loadError}
                  </p>
                  <button type="button" onClick={onRetry} className="btn btn-ghost">
                    {labels.retry}
                  </button>
                </td>
              </tr>
            ) : null}
            {!isPending && !isError && items && items.length === 0 ? (
              <tr>
                <td colSpan={5} className="table-message" role="status">
                  {labels.empty}
                </td>
              </tr>
            ) : null}
            {!isPending && !isError && items
              ? items.map((company, index) => {
                  const selected = selectedId === company.id;
                  return (
                    <tr
                      key={company.id}
                      tabIndex={0}
                      aria-selected={selected}
                      onClick={() => onOpen(company.id)}
                      onKeyDown={(event) => {
                        if (event.key !== "Enter" && event.key !== " ") return;
                        event.preventDefault();
                        onOpen(company.id);
                      }}
                      className={selected ? "row-enter is-selected" : "row-enter"}
                      style={{ "--row-index": index } as CSSProperties}
                    >
                      <td className="col-index">{offset + index + 1}</td>
                      <td className="cell-name">{company.name}</td>
                      <td className="cell-muted">{company.domain ?? labels.noDomain}</td>
                      <td>
                        <span className={`badge badge-${company.status}`}>
                          {labels.status[company.status]}
                        </span>
                      </td>
                      <td className="cell-muted">{formatDate(company.created_at)}</td>
                    </tr>
                  );
                })
              : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
