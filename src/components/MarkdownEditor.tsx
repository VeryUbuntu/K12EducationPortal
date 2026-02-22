'use client'

import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { v4 as uuidv4 } from 'uuid'
import { Button } from '@/components/ui/button'
import * as LucideIcons from 'lucide-react'

export function MarkdownEditor({
    name = 'description',
    defaultValue = '',
    placeholder = ''
}) {
    const [value, setValue] = useState(defaultValue)
    const [isUploading, setIsUploading] = useState(false)
    const textareaRef = useRef<HTMLTextAreaElement>(null)
    const supabase = createClient()

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
        <div className="border border-input rounded-md overflow-hidden bg-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 ring-offset-background">
            <div className="bg-slate-50 border-b border-input px-2 py-1 flex items-center justify-between">
                <div className="flex gap-1 text-xs text-muted-foreground items-center">
                    <LucideIcons.FileCode2 className="w-4 h-4 ml-1 mr-1" />
                    支持 Markdown 格式 & 截图直接粘贴 (Ctrl+V) 上传
                </div>
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
                        <Button type="button" variant="ghost" size="sm" className="h-7 px-2 cursor-pointer" disabled={isUploading} asChild>
                            <span>
                                {isUploading ? <LucideIcons.Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <LucideIcons.ImagePlus className="w-4 h-4 mr-1" />}
                                {isUploading ? '上传中...' : '上传图片'}
                            </span>
                        </Button>
                    </label>
                </div>
            </div>
            <textarea
                ref={textareaRef}
                name={name}
                value={value}
                onChange={e => setValue(e.target.value)}
                onPaste={handlePaste}
                placeholder={placeholder}
                className="w-full min-h-[160px] max-h-[500px] p-3 text-sm focus:outline-none resize-y font-mono"
            />
        </div>
    )
}
