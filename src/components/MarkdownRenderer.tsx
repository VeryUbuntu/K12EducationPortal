import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'

export function MarkdownRenderer({ content, className = '' }: { content: string, className?: string }) {
    return (
        <div className={`prose prose-slate max-w-none text-sm ${className} 
                       prose-headings:font-bold prose-headings:mt-4 prose-headings:mb-2 
                       prose-p:my-2 prose-a:text-primary prose-a:no-underline hover:prose-a:underline
                       prose-img:rounded-md prose-img:my-4 prose-img:shadow-sm`}>
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw]}
            >
                {content}
            </ReactMarkdown>
        </div>
    )
}
