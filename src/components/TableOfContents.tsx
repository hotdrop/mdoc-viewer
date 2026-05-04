import type { TocItem } from "@/lib/md/renderer";

type TableOfContentsProps = {
  toc: TocItem[];
};

export function TableOfContents({ toc }: TableOfContentsProps) {
  if (toc.length === 0) {
    return null;
  }

  return (
    <nav className="max-h-[calc(100vh-3rem)] overflow-y-auto rounded-lg border border-slate-800 bg-slate-950/40 p-4 text-sm">
      <h2 className="mb-3 font-semibold text-slate-200">目次</h2>
      <ul className="space-y-2">
        {toc.map((item) => (
          <li
            key={item.id}
            className="text-slate-400"
            style={{ paddingLeft: Math.max(0, item.depth - 2) * 16 }}
          >
            <a
              href={`#${item.id}`}
              className="transition hover:text-cyan-300"
            >
              {item.title}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
