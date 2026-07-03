import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

/**
 * Safe markdown rendering for LLM- and share-sourced content: no raw HTML
 * (stays escaped), links restricted to http(s) and forced to safe rel/target.
 */
export default function Markdown({ children }: { children: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        a: ({ href, children: kids }) =>
          href && /^https?:\/\//i.test(href) ? (
            <a href={href} target="_blank" rel="noopener noreferrer nofollow">
              {kids}
            </a>
          ) : (
            <span>{kids}</span>
          ),
      }}
    >
      {children}
    </ReactMarkdown>
  );
}
