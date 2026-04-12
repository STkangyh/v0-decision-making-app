'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import TextareaAutosize from 'react-textarea-autosize'
import { Header } from '@/components/header'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Spinner } from '@/components/ui/spinner'
import { createClient } from '@/lib/supabase/client'
import { getSessionId } from '@/lib/session'
import { CATEGORIES, CATEGORY_EMOJIS, DEADLINE_OPTIONS, type Category } from '@/lib/types'
import { checkProfanity } from '@/lib/moderate'
import { toast } from 'sonner'
import { ArrowLeft, ShieldWarning, PaperPlaneTilt } from '@phosphor-icons/react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

export default function NewDecisionPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [optionA, setOptionA] = useState('')
  const [optionB, setOptionB] = useState('')
  const [category, setCategory] = useState<Category>('기타')
  const [deadlineMinutes, setDeadlineMinutes] = useState<number>(60)
  const [profanityError, setProfanityError] = useState<string[] | null>(null)

  const isValid = title.trim() && optionA.trim() && optionB.trim()

  const clearError = () => setProfanityError(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isValid || isSubmitting) return

    setIsSubmitting(true)
    setProfanityError(null)

    try {
      const fields = [
        { label: '제목', value: title },
        { label: '설명', value: description },
        { label: '선택지 A', value: optionA },
        { label: '선택지 B', value: optionB },
      ].filter((f) => f.value.trim())

      for (const field of fields) {
        const { blocked, words } = await checkProfanity(field.value)
        if (blocked) {
          setProfanityError(words)
          document.getElementById(`field-${field.label}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
          return
        }
      }

      const supabase = createClient()
      const deadline = new Date(Date.now() + deadlineMinutes * 60 * 1000).toISOString()
      const authorSessionId = getSessionId()

      const { error } = await supabase.from('decisions').insert({
        title: title.trim(),
        description: description.trim() || null,
        option_a: optionA.trim(),
        option_b: optionB.trim(),
        category,
        deadline,
        author_session_id: authorSessionId,
      })

      if (error) throw error

      toast.success('결정 요청이 등록되었습니다!')
      router.push('/')
      router.refresh()
    } catch {
      toast.error('등록에 실패했습니다. 다시 시도해 주세요.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-2xl px-4 py-8">
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft weight="bold" className="h-4 w-4" />
          돌아가기
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        >
          {/* 비속어 감지 알림 */}
          {profanityError && (
            <Alert variant="destructive" className="mb-4">
              <ShieldWarning weight="fill" className="h-4 w-4" />
              <AlertTitle>부적절한 표현이 감지되었습니다</AlertTitle>
              <AlertDescription className="mt-1 space-y-1">
                <p>아래 표현은 커뮤니티 가이드라인에 위반됩니다. 수정 후 다시 시도해 주세요.</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {profanityError.map((word, i) => (
                    <span
                      key={i}
                      className="inline-block rounded bg-destructive/15 px-2 py-0.5 text-xs font-mono font-semibold text-destructive"
                    >
                      {word}
                    </span>
                  ))}
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* 카드 */}
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
              <form onSubmit={handleSubmit} className="space-y-5">

                {/* 제목 */}
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    제목 <span className="text-destructive">*</span>
                  </label>
                  <TextareaAutosize
                    id="field-제목"
                    placeholder="예: 오늘 저녁 뭐 먹지?"
                    value={title}
                    onChange={(e) => { setTitle(e.target.value); clearError() }}
                    maxLength={100}
                    minRows={1}
                    maxRows={3}
                    className={cn(
                      'w-full resize-none rounded-xl border border-border bg-muted/40 px-3 py-2.5 text-sm font-semibold placeholder:text-muted-foreground/50',
                      'focus:outline-none focus:ring-2 focus:ring-orange-400/60 focus:border-transparent',
                      'transition-all duration-200',
                      profanityError && 'border-destructive focus:ring-destructive/60'
                    )}
                  />
                </div>

                {/* 설명 */}
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    설명 <span className="text-muted-foreground/50 font-normal">(선택)</span>
                  </label>
                  <TextareaAutosize
                    id="field-설명"
                    placeholder="상황을 자세히 설명해 주세요"
                    value={description}
                    onChange={(e) => { setDescription(e.target.value); clearError() }}
                    maxLength={500}
                    minRows={2}
                    maxRows={5}
                    className={cn(
                      'w-full resize-none rounded-xl border border-border bg-muted/40 px-3 py-2.5 text-sm placeholder:text-muted-foreground/50',
                      'focus:outline-none focus:ring-2 focus:ring-orange-400/60 focus:border-transparent',
                      'transition-all duration-200',
                      profanityError && 'border-destructive focus:ring-destructive/60'
                    )}
                  />
                </div>

                {/* 선택지 A / B */}
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      선택지 A <span className="text-destructive">*</span>
                    </label>
                    <TextareaAutosize
                      id="field-선택지 A"
                      placeholder="첫 번째 선택지"
                      value={optionA}
                      onChange={(e) => { setOptionA(e.target.value); clearError() }}
                      maxLength={100}
                      minRows={1}
                      maxRows={3}
                      className={cn(
                        'w-full resize-none rounded-xl border border-border bg-muted/40 px-3 py-2.5 text-sm placeholder:text-muted-foreground/50',
                        'focus:outline-none focus:ring-2 focus:ring-orange-400/60 focus:border-transparent',
                        'transition-all duration-200',
                        profanityError && 'border-destructive focus:ring-destructive/60'
                      )}
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      선택지 B <span className="text-destructive">*</span>
                    </label>
                    <TextareaAutosize
                      id="field-선택지 B"
                      placeholder="두 번째 선택지"
                      value={optionB}
                      onChange={(e) => { setOptionB(e.target.value); clearError() }}
                      maxLength={100}
                      minRows={1}
                      maxRows={3}
                      className={cn(
                        'w-full resize-none rounded-xl border border-border bg-muted/40 px-3 py-2.5 text-sm placeholder:text-muted-foreground/50',
                        'focus:outline-none focus:ring-2 focus:ring-orange-400/60 focus:border-transparent',
                        'transition-all duration-200',
                        profanityError && 'border-destructive focus:ring-destructive/60'
                      )}
                    />
                  </div>
                </div>

                {/* 하단 툴바 */}
                <div className="flex flex-col gap-3 border-t border-border pt-4">

                  {/* 카테고리 */}
                  <div>
                    <p className="mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">카테고리</p>
                    <div className="flex flex-wrap gap-1.5">
                      {CATEGORIES.map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setCategory(cat)}
                          className={cn(
                            'rounded-full border px-2.5 py-1 text-xs font-medium transition-all duration-150',
                            category === cat
                              ? 'border-orange-400 bg-orange-500 text-white shadow-sm'
                              : 'border-border bg-white text-foreground hover:border-orange-400 hover:bg-orange-50'
                          )}
                        >
                          {CATEGORY_EMOJIS[cat]} {cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 마감 시간 + 제출 버튼 */}
                  <div className="flex items-end justify-between gap-3">
                    <div className="flex-1">
                      <p className="mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">마감 시간</p>
                      <div className="flex flex-wrap gap-1.5">
                        {DEADLINE_OPTIONS.map((option) => (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => setDeadlineMinutes(option.value)}
                            className={cn(
                              'rounded-full border px-2.5 py-1 text-xs font-medium transition-all duration-150',
                              deadlineMinutes === option.value
                                ? 'border-orange-400 bg-orange-500 text-white shadow-sm'
                                : 'border-border bg-white text-foreground hover:border-orange-400 hover:bg-orange-50'
                            )}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* 원형 제출 버튼 */}
                    <button
                      type="submit"
                      disabled={!isValid || isSubmitting}
                      className={cn(
                        'flex h-12 w-12 shrink-0 items-center justify-center rounded-full shadow-lg transition-all duration-200',
                        'bg-orange-500 text-white',
                        'hover:bg-orange-600 hover:scale-110 active:scale-95',
                        'disabled:opacity-40 disabled:cursor-not-allowed disabled:scale-100'
                      )}
                    >
                      {isSubmitting ? (
                        <Spinner className="h-5 w-5" />
                      ) : (
                        <PaperPlaneTilt weight="fill" className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>
              </form>
          </div>
        </motion.div>
      </main>
    </div>
  )
}
