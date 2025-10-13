type MarkdownArticleProps = {
  html: string;
  className?: string;
};

export function MarkdownArticle({ html, className }: MarkdownArticleProps) {
  // html はサーバー側で rehype-sanitize 済み
  return (
    <article
      className={className}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
