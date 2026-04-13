import { Header } from '@/components/header'
import { DecisionList } from '@/components/decision-list'
import { HeroIcon } from '@/components/hero-icon'
import { ForkKnife, TShirt, GameController, BookOpen, Heart, Trophy, Handshake, Star } from '@phosphor-icons/react/dist/ssr'

const TAGS = [
  { icon: ForkKnife,      label: '음식',   color: 'text-orange-500 bg-orange-200 dark:bg-orange-900' },
  { icon: TShirt,         label: '패션',   color: 'text-orange-400 bg-orange-100  dark:bg-orange-900' },
  { icon: GameController, label: '여가',   color: 'text-orange-500  bg-orange-200  dark:bg-orange-900' },
  { icon: BookOpen,       label: '공부',   color: 'text-orange-600 bg-orange-200 dark:bg-orange-900' },
  { icon: Heart,          label: '연애',   color: 'text-orange-500  bg-orange-100   dark:bg-orange-900' },
  { icon: Trophy,         label: '스포츠', color: 'text-orange-600 bg-orange-200 dark:bg-orange-900' },
  { icon: Handshake,      label: '친구',   color: 'text-orange-600  bg-amber-100  dark:bg-orange-900' },
  { icon: Star,           label: '기타',   color: 'text-orange-400 bg-orange-50  dark:bg-orange-900' },
]

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="mx-auto max-w-3xl px-4 py-8">

        {/* 히어로 */}
        <div className="glass-card mb-8 rounded-3xl px-6 py-7">
          <div className="flex items-start gap-5">
            <div className="hidden sm:flex flex-col items-center gap-1.5">
              <HeroIcon />
            </div>
            <div className="flex-1">
              <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                결정 장애 해결소
              </p>
              <h1 className="text-2xl font-extrabold leading-tight">
                <span className="text-[var(--orange-600)]">고민은 우리한테 맡겨.</span>
                <br />
                <span className="text-foreground/75 text-xl">넌 그냥 딴짓해도 돼 😌</span>
              </h1>
              <p className="mt-2.5 text-sm text-muted-foreground leading-relaxed">
                일상의 작은 선택들을 익명의 친구들에게 던져봐요 — 오늘 점심부터 미래 전공까지 뭐든요 🍜
              </p>
              
            </div>
          </div>
        </div>

        <DecisionList />
      </main>
    </div>
  )
}
