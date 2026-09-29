import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import type { Lang } from '../content/schema'
import { CodeBlock } from './CodeBlock'

const LANGS: Lang[] = ['bash', 'yaml', 'text', 'ini']

export function Markdown({ children, className = '' }: { children: string; className?: string }) {
  return (
    <div className={`prose-lesson ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({ href, children }) => (
            <a href={href} target="_blank" rel="noopener noreferrer">
              {children}
            </a>
          ),
          table: ({ children }) => (
            <div className="table-wrap">
              <table>{children}</table>
            </div>
          ),
          // Los bloques ``` se renderizan con nuestro CodeBlock.
          pre: ({ children }) => <>{children}</>,
          code: ({ className: cls, children }) => {
            const match = /language-(\w+)/.exec(cls ?? '')
            const text = String(children).replace(/\n$/, '')
            if (!match && !text.includes('\n')) return <code>{children}</code>
            const lang = LANGS.includes(match?.[1] as Lang) ? (match![1] as Lang) : 'text'
            return <CodeBlock code={text} lang={lang} />
          },
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  )
}
