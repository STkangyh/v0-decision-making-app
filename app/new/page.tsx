'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Field, FieldLabel, FieldGroup } from '@/components/ui/field'
import { Spinner } from '@/components/ui/spinner'
import { createClient } from '@/lib/supabase/client'
import { CATEGORIES, CATEGORY_EMOJIS, DEADLINE_OPTIONS, type Category } from '@/lib/types'
import { checkProfanity } from '@/lib/moderate'
import { toast } from 'sonner'
import { ArrowLeft, Sparkles } from 'lucide-react'
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

  const isValid = title.trim() && optionA.trim() && optionB.trim()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isValid || isSubmitting) return

    setIsSubmitting(true)

    try {
      // 비속어 필터링: 제목 + 설명 + 선택지 통합 검사
      const combined = [title, description, optionA, optionB].filter(Boolean).join(' ')
      const { blocked, words } = await checkProfanity(combined)

      if (blocked) {
        toast.error(`부적절한 표현이 포함되어 있습니다: ${words.join(', ')}`)
        return
      }

      const supabase = createClient()
      const deadline = new Date(Date.now() + deadlineMinutes * 60 * 1000).toISOString()

      const { error } = await supabase.from('decisions').insert({
        title: title.trim(),
        description: description.trim() || null,
        option_a: optionA.trim(),
        option_b: optionB.trim(),
        category,
        deadline,
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
          <ArrowLeft className="h-4 w-4" />
          돌아가기
        </Link>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              새 결정 요청하기
            </CardTitle>
            <CardDescription>
              고민되는 선택을 올리면 익명의 친구들이 대신 결정해 줄 거예요
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <FieldGroup>
                <Field>
                  <FieldLabel>제목</FieldLabel>
                  <Input
                    placeholder="예: 오늘 저녁 뭐 먹지?"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    maxLength={100}
                  />
                </Field>

                <Field>
                  <FieldLabel>설명 (선택)</FieldLabel>
                  <Textarea
                    placeholder="상황을 자세히 설명해 주세요"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    maxLength={500}
                  />
                </Field>

                <Field>
                  <FieldLabel>카테고리</FieldLabel>
                  <div className="flex flex-wrap gap-2">
                    {CATEGORIES.map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setCategory(cat)}
                        className={cn(
                          'rounded-full border px-3 py-1.5 text-sm transition-colors',
                          category === cat
                            ? 'border-primary bg-primary text-primary-foreground'
                            : 'border-border bg-background hover:border-primary/50'
                        )}
                      >
                        {CATEGORY_EMOJIS[cat]} {cat}
                      </button>
                    ))}
                  </div>
                </Field>

                <Field>
                  <FieldLabel>투표 마감 시간</FieldLabel>
                  <div className="flex flex-wrap gap-2">
                    {DEADLINE_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setDeadlineMinutes(option.value)}
                        className={cn(
                          'rounded-full border px-3 py-1.5 text-sm transition-colors',
                          deadlineMinutes === option.value
                            ? 'border-primary bg-primary text-primary-foreground'
                            : 'border-border bg-background hover:border-primary/50'
                        )}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </Field>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Field>
                    <FieldLabel>선택지 A</FieldLabel>
                    <Input
                      placeholder="첫 번째 선택지"
                      value={optionA}
                      onChange={(e) => setOptionA(e.target.value)}
                      maxLength={100}
                    />
                  </Field>
                  <Field>
                    <FieldLabel>선택지 B</FieldLabel>
                    <Input
                      placeholder="두 번째 선택지"
                      value={optionB}
                      onChange={(e) => setOptionB(e.target.value)}
                      maxLength={100}
                    />
                  </Field>
                </div>
              </FieldGroup>

              <Button type="submit" className="w-full" disabled={!isValid || isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Spinner className="mr-2 h-4 w-4" />
                    등록 중...
                  </>
                ) : (
                  '결정 요청 등록하기'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
