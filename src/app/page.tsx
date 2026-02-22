import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FeaturedCarousel } from '@/components/FeaturedCarousel'

export default async function HomePage() {
  const supabase = await createClient()

  // Fetch slider configurations
  const { data: slides } = await supabase
    .from('carousel_slides')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true })

  // Fetch stages
  const { data: stages } = await supabase
    .from('stages')
    .select('*')
    .order('id')

  return (
    <div className="space-y-12 pb-10">
      {slides && slides.length > 0 ? (
        <section className="w-full">
          <FeaturedCarousel slides={slides} />
        </section>
      ) : (
        <section className="text-center space-y-4 py-10">
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl text-slate-900">
            探索无限知识的海洋
          </h1>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto">
            SXU.com 为小学、初中和高中提供全面的教育资源。从精选应用、优质学习指南到一站式网站，助你成长每一天。
          </p>
        </section>
      )}

      {/* Stage Selector */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold tracking-tight">🎓 选择学习阶段</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stages?.map(stage => (
            <Link href={`/${stage.slug}`} key={stage.id} className="block group">
              <Card className="h-full group-hover:shadow-lg transition-all group-hover:-translate-y-1 group-hover:border-primary">
                <CardHeader>
                  <CardTitle className="text-2xl text-center pb-2 border-b-2 border-transparent group-hover:border-primary inline-block transition-colors">{stage.name}</CardTitle>
                  <CardDescription className="text-center pt-2">
                    进入 {stage.name}
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
