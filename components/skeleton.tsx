export const SKELETON_ROW_COUNT = 6;

type SkeletonProps = {
  className?: string;
};

export function Skeleton({ className = "" }: SkeletonProps) {
  return <span className={`skeleton ${className}`.trim()} aria-hidden="true" />;
}

export function TableSkeletonHeader() {
  return (
    <tr aria-hidden="true">
      <th scope="col" className="col-index">
        <Skeleton className="skeleton-index" />
      </th>
      <th scope="col">
        <Skeleton className="skeleton-text" />
      </th>
      <th scope="col">
        <Skeleton className="skeleton-text-short" />
      </th>
      <th scope="col">
        <Skeleton className="skeleton-pill" />
      </th>
      <th scope="col">
        <Skeleton className="skeleton-text-short" />
      </th>
    </tr>
  );
}

export function TableSkeletonRows({ count = SKELETON_ROW_COUNT }: { count?: number }) {
  return Array.from({ length: count }, (_, index) => (
    <tr key={index} aria-hidden="true">
      <td className="col-index">
        <Skeleton className="skeleton-index" />
      </td>
      <td>
        <Skeleton className="skeleton-text" />
      </td>
      <td>
        <Skeleton className="skeleton-text-short" />
      </td>
      <td>
        <Skeleton className="skeleton-pill" />
      </td>
      <td>
        <Skeleton className="skeleton-text-short" />
      </td>
    </tr>
  ));
}

export function PageSkeleton({ label }: { label: string }) {
  return (
    <div className="app-canvas">
      <div className="app-frame" aria-busy="true">
        <aside className="sidebar">
          <nav className="sidebar-nav" aria-hidden="true">
            <span className="nav-item">
              <Skeleton className="skeleton-nav-icon" />
              <Skeleton className="skeleton-nav-label" />
            </span>
          </nav>
          <div className="sidebar-footer">
            <Skeleton className="skeleton-button skeleton-signout" />
          </div>
        </aside>
        <div className="app-main">
          <span className="sr-only" role="status">
            {label}
          </span>
          <header className="page-header">
            <div className="page-tools">
              <Skeleton className="skeleton-lang" />
            </div>
            <div className="page-title-row">
              <Skeleton className="skeleton-title" />
              <Skeleton className="skeleton-button skeleton-button-primary" />
            </div>
          </header>
          <div className="filters" aria-hidden="true">
            <Skeleton className="skeleton-search" />
            <Skeleton className="skeleton-select" />
          </div>
          <div className="table-card">
            <div className="table-card-title">
              <Skeleton className="skeleton-card-title" />
            </div>
            <div className="table-scroll">
              <table className="data-table" aria-hidden="true">
                <thead>
                  <TableSkeletonHeader />
                </thead>
                <tbody>
                  <TableSkeletonRows />
                </tbody>
              </table>
            </div>
          </div>
          <nav className="pager" aria-hidden="true">
            <Skeleton className="skeleton-pager" />
            <div className="pager-actions">
              <Skeleton className="skeleton-icon-btn" />
              <Skeleton className="skeleton-icon-btn" />
            </div>
          </nav>
        </div>
      </div>
    </div>
  );
}

export function AuthSkeleton({ label }: { label: string }) {
  return (
    <div className="app-canvas app-canvas-center">
      <div className="auth-card" aria-busy="true">
        <span className="sr-only" role="status">
          {label}
        </span>
        <div className="page-title-row">
          <Skeleton className="skeleton-title" />
          <Skeleton className="skeleton-lang" />
        </div>
        <div className="auth-form">
          <div className="field">
            <Skeleton className="skeleton-label" />
            <Skeleton className="skeleton-input" />
            <Skeleton className="skeleton-hint" />
          </div>
          <Skeleton className="skeleton-button skeleton-button-primary" />
        </div>
      </div>
    </div>
  );
}

export function DrawerSkeleton() {
  return (
    <div className="drawer-form" aria-busy="true">
      <div className="drawer-scroll">
        {["name", "domain", "status"].map((field) => (
          <div key={field} className="field" aria-hidden="true">
            <Skeleton className="skeleton-label" />
            <Skeleton className="skeleton-input" />
          </div>
        ))}
      </div>
      <div className="drawer-footer" aria-hidden="true">
        <Skeleton className="skeleton-button" />
        <Skeleton className="skeleton-button skeleton-button-primary" />
      </div>
    </div>
  );
}
