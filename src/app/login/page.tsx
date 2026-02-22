'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createClient } from '@/lib/supabase/client'
import * as LucideIcons from 'lucide-react'

function AuthForm() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const next = searchParams.get('next') ?? '/'

    const [mode, setMode] = useState<'login' | 'register' | 'reset'>('login')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [otpToken, setOtpToken] = useState('')

    const [step, setStep] = useState<'form' | 'verify'>('form')
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState({ type: '', text: '' })

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setMessage({ type: '', text: '' })

        const supabase = createClient()

        if (mode === 'register') {
            // 注册逻辑：提供邮箱和密码，Supabase 会向邮箱发送数字验证码 (Token)
            const { error } = await supabase.auth.signUp({
                email,
                password,
            })

            if (error) {
                setMessage({ type: 'error', text: `注册出错: ${error.message}` })
            } else {
                setMessage({ type: 'success', text: '已向您的邮箱发送了数字验证码，请查收！' })
                setStep('verify') // 进入验证码输入步骤
            }
        } else if (mode === 'reset') {
            // 忘记密码逻辑：发送密码重置邮件
            const { error } = await supabase.auth.resetPasswordForEmail(email)

            if (error) {
                setMessage({ type: 'error', text: `发送重置邮件失败: ${error.message}` })
            } else {
                setMessage({ type: 'success', text: '密码重置验证码已发送至您的邮箱！' })
                setStep('verify') // 进入验证码及新密码输入步骤
            }
        } else {
            // 登录逻辑：使用邮箱和密码登录
            // 如果你希望每次登录都「强制」用验证码，可以切换为 supabase.auth.signInWithOtp({ email })
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            })

            if (error) {
                // 如果报错可能是邮箱未验证，可以提供再次发送验证码的按钮
                if (error.message.includes('Email not confirmed')) {
                    setMessage({ type: 'error', text: `邮箱未验证，请先验证。` })
                    // 如果需要，可以自动发送 OTP 并跳转
                    const { error: resendError } = await supabase.auth.resend({
                        type: 'signup',
                        email: email
                    })
                    if (!resendError) setStep('verify')
                } else {
                    setMessage({ type: 'error', text: `登录出错: ${error.message}` })
                }
            } else {
                // 登录成功，直接挑战
                router.push(next)
                router.refresh()
            }
        }
        setLoading(false)
    }

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setMessage({ type: '', text: '' })

        const supabase = createClient()

        // 验证验证码 (区分注册与密码找回)
        const { error } = await supabase.auth.verifyOtp({
            email,
            token: otpToken,
            type: mode === 'reset' ? 'recovery' : 'signup'
        })

        if (error) {
            setMessage({ type: 'error', text: `验证失败: ${error.message}` })
            setLoading(false)
            return
        }

        if (mode === 'reset') {
            // 如果是密码重置模式，验证成功后（此时已被授予临时会话），更新新密码
            const { error: updateError } = await supabase.auth.updateUser({
                password: newPassword
            })

            if (updateError) {
                setMessage({ type: 'error', text: `密码更新失败: ${updateError.message}` })
            } else {
                setMessage({ type: 'success', text: '密码重置成功！正在进入...' })
                router.push(next)
                router.refresh()
            }
        } else {
            setMessage({ type: 'success', text: '验证成功！正在进入...' })
            router.push(next)
            router.refresh()
        }
        setLoading(false)
    }

    return (
        <Card className="w-full max-w-sm shadow-lg border-primary/10">
            <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-2">
                    {step === 'verify' ? <LucideIcons.KeyRound className="w-6 h-6 text-primary" /> : <LucideIcons.UserCircle className="w-6 h-6 text-primary" />}
                    {step === 'verify' ? (mode === 'reset' ? '重置密码' : '输入验证码') : (mode === 'login' ? '密码登录' : mode === 'register' ? '注册账号' : '找回密码')}
                </CardTitle>
                <CardDescription>
                    {step === 'verify'
                        ? '请输入您邮箱中收到的数字验证码（通常为 6 或 8 位）。'
                        : mode === 'reset'
                            ? '输入您的注册邮箱，我们将向您发送用于重置密码的验证码。'
                            : '首选密码登录。新用户请准备好接收邮箱数字验证码。'}
                </CardDescription>
            </CardHeader>

            {step === 'form' ? (
                <form onSubmit={handleAuth}>
                    <CardContent className="grid gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="email">邮箱地址</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="student@sxu.com"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        {mode !== 'reset' && (
                            <div className="grid gap-2">
                                <Label htmlFor="password">密码</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="至少 6 位密码"
                                    required
                                    minLength={6}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                        )}

                        {message.text && (
                            <p className={`text-sm font-medium ${message.type === 'error' ? 'text-rose-500' : 'text-emerald-500'}`}>
                                {message.text}
                            </p>
                        )}
                    </CardContent>

                    <CardFooter className="flex flex-col gap-4">
                        <Button className="w-full" type="submit" disabled={loading}>
                            {loading ? '处理中...' : (mode === 'login' ? '登录' : mode === 'register' ? '注册并获取验证码' : '发送重置验证码')}
                        </Button>

                        <div className="flex flex-col gap-2 mt-2">
                            {mode === 'login' && (
                                <div className="text-sm text-center">
                                    <button
                                        type="button"
                                        onClick={() => { setMode('reset'); setMessage({ type: '', text: '' }) }}
                                        className="text-slate-500 hover:text-primary transition-colors hover:underline"
                                    >
                                        忘记密码？
                                    </button>
                                </div>
                            )}

                            <div className="text-sm text-center text-slate-500 mt-2">
                                {mode === 'login' ? '还没有账号？' : '已有账号？'}
                                <button
                                    type="button"
                                    onClick={() => {
                                        setMode(mode === 'login' ? 'register' : 'login')
                                        setMessage({ type: '', text: '' })
                                    }}
                                    className="ml-1 text-primary hover:underline font-semibold"
                                >
                                    {mode === 'login' ? '立即注册' : '返回登录'}
                                </button>
                            </div>
                        </div>
                    </CardFooter>
                </form>
            ) : (
                <form onSubmit={handleVerifyOtp}>
                    <CardContent className="grid gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="otp">数字验证码</Label>
                            <Input
                                id="otp"
                                type="text"
                                inputMode="numeric"
                                pattern="[0-9]*"
                                placeholder="123456" // or 12345678 based on length
                                maxLength={8}
                                required
                                value={otpToken}
                                onChange={(e) => setOtpToken(e.target.value)}
                                className="text-center text-2xl tracking-widest font-mono"
                            />
                        </div>

                        {mode === 'reset' && (
                            <div className="grid gap-2">
                                <Label htmlFor="newPassword">设置新密码</Label>
                                <Input
                                    id="newPassword"
                                    type="password"
                                    placeholder="请输入至少 6 位的新密码"
                                    required
                                    minLength={6}
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                />
                            </div>
                        )}

                        {message.text && (
                            <p className={`text-sm font-medium ${message.type === 'error' ? 'text-rose-500' : 'text-emerald-500'}`}>
                                {message.text}
                            </p>
                        )}
                    </CardContent>
                    <CardFooter className="flex flex-col gap-4">
                        <Button className="w-full" type="submit" disabled={loading}>
                            {loading ? '验证中...' : '提交验证'}
                        </Button>
                        <button
                            type="button"
                            onClick={() => setStep('form')}
                            className="text-sm text-slate-500 hover:text-slate-800 transition-colors"
                        >
                            返回上一步
                        </button>
                    </CardFooter>
                </form>
            )}
        </Card>
    )
}

export default function LoginPage() {
    return (
        <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center">
            <Suspense fallback={<div>Loading...</div>}>
                <AuthForm />
            </Suspense>
        </div>
    )
}
