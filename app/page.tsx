import { Header } from '@/components/header'
import { DecisionList } from '@/components/decision-list'

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="mx-auto max-w-3xl px-4 py-8">

        {/* 히어로 */}
        <div className="mb-8 rounded-2xl border border-primary/10 bg-gradient-to-br from-primary/5 via-white to-accent/5 px-6 py-7 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="text-4xl">🎯</div>
            <div>
              <h1 className="text-2xl font-extrabold leading-snug">
                <span className="gradient-text">고민은 우리한테 맡겨.</span>
                <br />
                <span className="text-foreground/80 text-xl font-semibold">넌 그냥 딴짓해도 돼 😌</span>
              </h1>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                일상의 작은 선택들을 익명의 친구들에게 던져봐요 — 오늘 점심부터 미래의 전공까지 🍜
              </p>
              <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
                {['🍽️ 음식', '👗 패션', '🎮 여가', '📚 공부', '💕 연애'].map((tag) => (
                  <span key={tag} className="rounded-full bg-primary/8 px-2.5 py-1 font-medium text-primary/80">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <DecisionList />
      </main>
    </div>
  )
}
