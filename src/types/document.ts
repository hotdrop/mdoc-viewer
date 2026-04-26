export type DocumentFrontmatter = {
  title?: string;
  description?: string;
  tags?: string[];
};

export type DocumentContent = {
  relativePath: string;
  viewerPath: string;
  body: string;
  frontmatter: DocumentFrontmatter;
  etag: string;
  updatedAt: Date;
  lastModified: Date;
};

export type RecentDocument = {
  relativePath: string;
  viewerPath: string;
  title: string;
  updatedAt: Date;
};

export type SearchHeading = {
  title: string;
  id: string;
};

export type IndexableDocument = {
  relativePath: string;
  viewerPath: string;
  title: string;
  updatedAt: Date;
  excerpt: string;
  headings: SearchHeading[];
  bodyText: string;
};

export type DocumentTreeNode = {
  label: string;
  path: string;
  href?: string;
  children: DocumentTreeNode[];
};
