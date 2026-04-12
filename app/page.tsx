import { Header } from '@/components/header'
import { DecisionList } from '@/components/decision-list'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-3xl px-4 py-8">
        <div className="mb-8">
          <h1 className="text-balance text-2xl font-bold text-foreground">
            공부하는 동안,{' '}
            <span className="text-primary">결정은 우리가</span>
          </h1>
          <p className="mt-2 text-muted-foreground">
            고민되는 일상의 작은 선택들을 익명의 친구들에게 맡겨보세요
          </p>
        </div>
        <DecisionList />
      </main>
    </div>
  )
}
