'use client'

import { useState, useRef } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { Button } from '@/components/ui/button'
import * as LucideIcons from 'lucide-react'
import { MarkdownRenderer } from '@/components/MarkdownRenderer'

export function MarkdownEditor({
    name = 'description',
    defaultValue = '',
    placeholder = ''
}) {
    const [value, setValue] = useState(defaultValue)
    const [isUploading, setIsUploading] = useState(false)
    const [mode, setMode] = useState<'edit' | 'preview'>('edit')
    const textareaRef = useRef<HTMLTextAreaElement>(null)

    const insertTextAtCursor = (text: string) => {
        const textarea = textareaRef.current
        if (!textarea) return
        const start = textarea.selectionStart
        const end = textarea.selectionEnd
        const newValue = value.substring(0, start) + text + value.substring(end)
        setValue(newValue)

        // Focus back and set cursor
        setTimeout(() => {
            textarea.focus()
            textarea.setSelectionRange(start + text.length, start + text.length)
        }, 0)
    }

    const handleFileUpload = async (file: File) => {
        if (!file.type.startsWith('image/')) return
        setIsUploading(true)

        const uniqueId = Math.random().toString(36).substring(7)
        const placeholderText = `\n![正在上传图片... ${uniqueId}]()\n`
        insertTextAtCursor(placeholderText)

        try {
            const ext = file.name && file.name.includes('.') ? file.name.split('.').pop() : 'png'
            const filename = `${uuidv4()}.${ext}`

            const formData = new FormData()
            formData.append('file', file)
            formData.append('filename', filename)

            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formData
            })

            if (!res.ok) {
                const errorData = await res.json()
                throw new Error(errorData.error || 'Upload failed')
            }

            const { publicUrl } = await res.json()
            setValue(prev => prev.replace(placeholderText, `\n![图片](${publicUrl})\n`))
        } catch (error) {
            console.error("Upload failed", error)
            setValue(prev => prev.replace(placeholderText, `\n<!-- 图片上传失败: 请检查网络或控制台报错 -->\n`))
        } finally {
            setIsUploading(false)
        }
    }

    const handlePaste = (e: React.ClipboardEvent) => {
        const items = e.clipboardData.items
        for (let i = 0; i < items.length; i++) {
            if (items[i].type.indexOf('image') !== -1) {
                const file = items[i].getAsFile()
                if (file) {
                    e.preventDefault()
                    handleFileUpload(file)
                    break
                }
            }
        }
    }

    return (
        <div className={`border border-input rounded-md overflow-hidden bg-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 ring-offset-background ${mode === 'preview' ? 'ring-0 border-transparent bg-transparent' : ''}`}>
            <div className={`bg-slate-50 border-input px-2 py-1 flex flex-wrap items-center justify-between gap-2 ${mode === 'edit' ? 'border-b' : 'rounded-md border mb-2 bg-slate-100/50'}`}>
                <div className="flex gap-1 text-xs text-muted-foreground items-center">
                    <button
                        type="button"
                        onClick={() => setMode('edit')}
                        className={`flex items-center gap-1 px-3 py-1.5 rounded-sm transition-colors ${mode === 'edit' ? 'bg-white shadow-sm text-slate-800 font-medium border border-slate-200/60' : 'hover:bg-slate-200/50'}`}
                    >
                        <LucideIcons.FileCode2 className="w-4 h-4" />
                        编辑
                    </button>
                    <button
                        type="button"
                        onClick={() => setMode('preview')}
                        className={`flex items-center gap-1 px-3 py-1.5 rounded-sm transition-colors ${mode === 'preview' ? 'bg-white shadow-sm text-slate-800 font-medium border border-slate-200/60' : 'hover:bg-slate-200/50'}`}
                    >
                        <LucideIcons.Eye className="w-4 h-4" />
                        预览
                    </button>
                    {mode === 'edit' && <span className="ml-2 hidden sm:inline-block">支持 Markdown 格式 & 截图粘贴 (Ctrl+V)</span>}
                </div>
                {mode === 'edit' && (
                    <div>
                        <input
                            type="file"
                            id="md-img-upload"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                                if (e.target.files && e.target.files[0]) {
                                    handleFileUpload(e.target.files[0])
                                    e.target.value = ''
                                }
                            }}
                        />
                        <label htmlFor="md-img-upload">
                            <Button type="button" variant="outline" size="sm" className="h-8 px-3 cursor-pointer bg-white" disabled={isUploading} asChild>
                                <span>
                                    {isUploading ? <LucideIcons.Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <LucideIcons.ImagePlus className="w-4 h-4 mr-1" />}
                                    {isUploading ? '上传中...' : '插入图片'}
                                </span>
                            </Button>
                        </label>
                    </div>
                )}
            </div>
            {mode === 'edit' ? (
                <textarea
                    ref={textareaRef}
                    name={name}
                    value={value}
                    onChange={e => setValue(e.target.value)}
                    onPaste={handlePaste}
                    placeholder={placeholder}
                    className="w-full min-h-[200px] max-h-[600px] p-3 text-sm focus:outline-none resize-y font-mono"
                />
            ) : (
                <div className="p-4 min-h-[200px] bg-white border border-input rounded-md shadow-sm">
                    {/* Keep a hidden input so the form still gets the value when submitted in preview mode */}
                    <input type="hidden" name={name} value={value} />
                    {value.trim() ? (
                        <MarkdownRenderer content={value} />
                    ) : (
                        <p className="text-muted-foreground text-sm italic py-8 text-center bg-slate-50/50 rounded">暂无内容以供预览...</p>
                    )}
                </div>
            )}
        </div>
    )
}
