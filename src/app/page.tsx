'use client';

import { useEffect, useSyncExternalStore, useCallback, memo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon, Sparkles, Play, Pause, ExternalLink, Waves, Music4, ChevronRight, Radio, Clock3 } from 'lucide-react';
import { useTheme } from 'next-themes';
import { FloatingPlayer } from '@/components/lofi/floating-player';
import { useAudioPlayer } from '@/hooks/useAudioPlayer';
import { useFocusTimer } from '@/hooks/useFocusTimer';
import { useSleepTimer } from '@/hooks/useSleepTimer';

import { useAudioStore } from '@/store/audioStore';
import { stations } from '@/lib/stations';
import { MOBILE_ISLAND_EXPAND_LEARNED_EVENT, MOBILE_ISLAND_HINT_DISMISSED_KEY } from '@/lib/mobile-island-events';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { cn } from '@/lib/utils';
import { homepageFaqs } from '@/lib/seo-content';

function useMounted() {
  return useSyncExternalStore(() => () => {}, () => true, () => false);
}

// ==================== 实时时钟 Hook ====================
function useClock() {
  const [time, setTime] = useState<{
    h: string; m: string; s: string; date: string; greeting: string;
  } | null>(null);

  useEffect(() => {
    const update = () => {
      const now = new Date();
      const h = now.getHours();
      const greeting = h < 6 ? '深夜好' : h < 12 ? '早上好' : h < 18 ? '下午好' : h < 22 ? '晚上好' : '深夜好';
      const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
      setTime({
        h: String(h).padStart(2, '0'),
        m: String(now.getMinutes()).padStart(2, '0'),
        s: String(now.getSeconds()).padStart(2, '0'),
        date: `${weekdays[now.getDay()]}  ${now.getMonth() + 1}月${now.getDate()}日`,
        greeting,
      });
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);

  return time;
}

// ==================== 动画变体 ====================
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' as const } },
};
const stagger = { visible: { transition: { staggerChildren: 0.08 } } };
const scaleIn = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.4, ease: 'easeOut' as const } },
};

// ==================== 实时时钟组件 ====================
const LiveClock = memo(({ isDark, stationColor, isPlaying }: { isDark: boolean; stationColor: string; isPlaying: boolean }) => {
  const clock = useClock();
  if (!clock) return null;

  const timeGradient = isDark
    ? `linear-gradient(120deg, rgba(255,255,255,0.96), ${stationColor}d0, rgba(255,255,255,0.86))`
    : `linear-gradient(120deg, #0f172a, ${stationColor}, #4f46e5)`;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, delay: 0.3 }}
      className={cn(
        "inline-flex flex-col items-center px-8 py-5 rounded-3xl mb-8",
        isDark ? "bg-white/[0.03]" : "bg-black/[0.02]"
      )}
      style={{
        border: isDark ? '1px solid rgba(255,255,255,0.06)' : `1px solid ${stationColor}2e`,
        boxShadow: isDark ? 'none' : `0 10px 30px ${stationColor}12`
      }}
    >
      
                  ))}
                </div>
              </motion.div>

              <AnimatePresence>
                {showMobileHint && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ delay: 0.7, duration: 0.4 }}
                    className="sm:hidden flex justify-center mt-1"
                  >
                    <div
                      className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full backdrop-blur-xl"
                      style={{
                        background: isDark
                          ? 'linear-gradient(135deg, rgba(147,51,234,0.18), rgba(236,72,153,0.14))'
                          : 'linear-gradient(135deg, rgba(233,213,255,0.68), rgba(252,231,243,0.74))',
                        border: isDark
                          ? '1px solid rgba(255,255,255,0.14)'
                          : '1px solid rgba(168,85,247,0.24)',
                        boxShadow: isDark
                          ? '0 4px 12px rgba(88,28,135,0.16)'
                          : '0 4px 12px rgba(168,85,247,0.10)'
                      }}
                    >
                      <span className="text-xs" style={{ color: isDark ? '#F5E8FF' : '#6B21A8' }}>
                        双击灵动岛展开播放器
                      </span>
                      <span className="text-xs" style={{ color: isDark ? 'rgba(245,232,255,0.45)' : 'rgba(107,33,168,0.35)' }}>·</span>
                      <span className="text-xs" style={{ color: isDark ? 'rgba(245,232,255,0.82)' : 'rgba(107,33,168,0.72)' }}>
                        拖动可移动位置
                      </span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* 正在播放 */}
              <AnimatePresence>
                {isPlaying && currentStation && (
                  <motion.div initial={{ opacity: 0, y: 12, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 12, scale: 0.95 }}
                    transition={{ type: 'spring', damping: 22 }} className="mt-6 flex justify-center">
                    <motion.div className="inline-flex items-center gap-3 px-4 py-2.5 rounded-full cursor-pointer"
                      style={{ background: isDark ? 'rgba(0,0,0,0.55)' : 'rgba(255,255,255,0.92)', backdropFilter: 'blur(16px)', border: `1px solid ${stationColor}25`, boxShadow: `0 4px 20px ${stationColor}15` }}
                      onClick={() => setMiniMode(false)} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                      <motion.div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: `${stationColor}22` }}
                        animate={{ rotate: 360 }} transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}>
                        <Music4 className="w-3.5 h-3.5" style={{ color: stationColor }} />
                      </motion.div>
                      <div className="flex flex-col">
                        <span className={cn("text-xs font-semibold", isDark ? "text-white" : "text-zinc-900")}>正在播放</span>
                        <span className={cn("text-[10px]", isDark ? "text-white/45" : "text-zinc-500")}>{currentStation.name}</span>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold" style={{ background: `${stationColor}20`, color: stationColor }}>{currentStation.style1}</span>
                      <motion.div className="w-1.5 h-1.5 rounded-full" style={{ background: stationColor }} animate={{ scale: [1, 1.5, 1], opacity: [1, 0.4, 1] }} transition={{ duration: 1.2, repeat: Infinity }} />
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* 状态统计 */}
              <AnimatePresence>
                {(focusTime > 0 || remainingSeconds !== null) && (
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }} className="mt-4 flex flex-wrap justify-center gap-3">
                    {focusTime > 0 && (
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full" style={{ background: isDark ? `${stationColor}12` : `${stationColor}08`, border: `1px solid ${stationColor}20` }}>
                        <Clock3 className="w-3 h-3" style={{ color: stationColor }} />
                        <span className="text-xs font-medium" style={{ color: stationColor }}>
                          今日专注 {focusTime < 60 ? `${focusTime} 分钟` : `${Math.floor(focusTime / 60)} 小时 ${focusTime % 60} 分钟`}
                        </span>
                      </div>
                    )}
                    {remainingSeconds !== null && (
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full" style={{ background: isDark ? `${stationColor}12` : `${stationColor}08`, border: `1px solid ${stationColor}20` }}>
                        <Moon className="w-3 h-3" style={{ color: stationColor }} />
                        <span className="text-xs font-medium tabular-nums" style={{ color: stationColor }}>
                          即将睡眠 {Math.floor(remainingSeconds / 60).toString().padStart(2, '0')}:{(remainingSeconds % 60).toString().padStart(2, '0')}
                        </span>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section className="sm:py-2 px-4 sm:px-6">
          <div className="max-w-5xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="text-center mb-10">
              <h2 className={cn("text-2xl sm:text-3xl font-bold mb-3", isDark ? "text-white" : "text-zinc-900")}>为什么选择 Lofi Radio</h2>
              <p className={cn("text-base sm:text-lg max-w-xl mx-auto", isDark ? "text-white/38" : "text-zinc-500")}>专为专注设计，让音乐成为你工作和学习的最佳伴侣</p>
            </motion.div>
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={stagger} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {features.map((f) => <FeatureCard key={f.title} feature={f} isDark={isDark} />)}
            </motion.div>
          </div>
        </section>

        {/* 使用场景 Section */}
        <section className="py-6 sm:py-8 px-4 sm:px-6">
          <div className="max-w-5xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="text-center mb-10">
              <h2 className={cn("text-2xl sm:text-3xl font-bold mb-3", isDark ? "text-white" : "text-zinc-900")}>适用场景</h2>
              <p className={cn("text-base sm:text-lg", isDark ? "text-white/38" : "text-zinc-500")}>无论学习、工作还是放松，总有一个电台适合你</p>
            </motion.div>
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              {scenes.map((s) => <SceneCard key={s.title} scene={s} isDark={isDark} onClick={() => handleSceneClick(s.id)} />)}
            </motion.div>
          </div>
        </section>

        {/* 电台展示 */}
        <section className="py-6 sm:py-8 px-4 sm:px-6">
          <div className="max-w-5xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="text-center mb-10">
              <h2 className={cn("text-2xl sm:text-3xl font-bold mb-3", isDark ? "text-white" : "text-zinc-900")}>精选电台</h2>
              <p className={cn("text-base sm:text-lg", isDark ? "text-white/38" : "text-zinc-500")}>涵盖多种风格，总有适合你的音乐</p>
            </motion.div>
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {stations.slice(0, 8).map((station) => (
                <StationCard key={station.id} station={station} isDark={isDark} isActive={currentStation?.id === station.id} isPlaying={isPlaying} onClick={() => handleStationClick(station.id)} />
              ))}
            </motion.div>
            <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mt-6">
              <Button variant="outline" size="sm" className={cn("rounded-full gap-2 px-5 h-9", isDark && "border-white/15 text-white/60 hover:bg-white/[0.07] hover:text-white/80")} onClick={() => setMiniMode(false)}>
                查看全部电台
                <ChevronRight className="w-4 h-4" />
              </Button>
            </motion.div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-6 sm:py-10 px-4 sm:px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="max-w-3xl mx-auto text-center">
            <div className="relative p-8 sm:p-12 rounded-3xl overflow-hidden" style={{
              background: isDark ? 'linear-gradient(135deg, rgba(139,92,246,0.1), rgba(217,70,239,0.05))' : 'linear-gradient(135deg, rgba(139,92,246,0.07), rgba(217,70,239,0.03))',
              border: isDark ? '1px solid rgba(139,92,246,0.18)' : '1px solid rgba(139,92,246,0.12)',
            }}>
              <div className="absolute top-6 right-8 w-24 h-24 rounded-full blur-2xl opacity-20" style={{ background: 'radial-gradient(circle, #8B5CF6, transparent)' }} />
              <div className="absolute bottom-4 left-6 w-16 h-16 rounded-full blur-xl opacity-15" style={{ background: 'radial-gradient(circle, #EC4899, transparent)' }} />
              <h2 className={cn("text-2xl sm:text-3xl font-bold mb-3 relative", isDark ? "text-white" : "text-zinc-900")}>开始你的专注之旅</h2>
              <p className={cn("text-sm sm:text-base mb-8 relative max-w-xl mx-auto leading-relaxed", isDark ? "text-white/45" : "text-zinc-500")}>
                无需注册，无需下载，打开网页即可享受高品质的专注音乐。让 Lofi Radio 成为你每天工作学习的最佳伴侣。
              </p>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="relative inline-block">
                <Button size="lg" onClick={() => { togglePlay(); if (!userWantsPlay) setMiniMode(false); }}
                  className="rounded-full px-8 h-12 text-base font-semibold shadow-xl"
                  style={{ background: 'linear-gradient(135deg, #8B5CF6, #D946EF)', boxShadow: '0 8px 32px rgba(139,92,246,0.4)' }}>
                  {userWantsPlay ? <><Pause className="w-5 h-5 mr-2" />{isLoading ? '加载中...' : '正在播放'}</> : <><Play className="w-5 h-5 mr-2" />立即开始</>}
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </section>

        <section className="py-6 sm:py-10 px-4 sm:px-6">
          <div className="max-w-5xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="text-center mb-8 sm:mb-10">
              <div className="mb-3 flex justify-center">
                <span
                  className={cn(
                    "inline-flex items-center rounded-full px-3 py-1 text-[11px] sm:text-xs font-semibold tracking-[0.18em] uppercase",
                    isDark ? "bg-white/[0.05] text-white/45 border border-white/[0.07]" : "bg-black/[0.03] text-zinc-500 border border-black/[0.05]"
                  )}
                >
                  FAQ
                </span>
              </div>
              <h2 className={cn("text-2xl sm:text-3xl font-bold mb-3", isDark ? "text-white" : "text-zinc-900")}>Lofi Radio 常见问题</h2>
              <p className={cn("text-sm sm:text-base max-w-3xl mx-auto leading-relaxed", isDark ? "text-white/38" : "text-zinc-500")}>把使用时最容易遇到的几个问题整理在这里，既方便第一次打开网站时快速了解，也能帮你更快找到适合自己的收听方式和使用场景。</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45 }}
              className={cn(
                "rounded-[28px] p-3 sm:p-4 border overflow-hidden",
                isDark
                  ? "bg-white/[0.03] border-white/[0.06] shadow-[0_24px_80px_rgba(0,0,0,0.28)]"
                  : "bg-white/90 border-black/[0.05] shadow-[0_20px_60px_rgba(15,23,42,0.08)]"
              )}
            >
              <Accordion type="single" collapsible className="w-full">
                {homepageFaqs.map((faq, index) => (
                  <AccordionItem
                    key={faq.question}
                    value={`faq-${index}`}
                    className={cn(
                      "rounded-[22px] border mb-2 last:mb-0 px-4 sm:px-6 transition-colors",
                      isDark
                        ? "border-white/[0.07] bg-white/[0.02] hover:bg-white/[0.035] data-[state=open]:bg-white/[0.04]"
                        : "border-black/[0.04] bg-black/[0.02] hover:bg-black/[0.03] data-[state=open]:bg-black/[0.03]"
                    )}
                  >
                    <AccordionTrigger
                      className={cn(
                        "min-h-12 py-4 sm:py-5 text-sm sm:text-base font-semibold no-underline hover:no-underline [&>svg]:size-3 [&>svg]:shrink-0 gap-0.5 sm:gap-4",
                        isDark ? "text-white/88" : "text-zinc-900"
                      )}
                    >
                      <span className="leading-6">{faq.question}</span>
                    </AccordionTrigger>
                    <AccordionContent className={cn("pb-4 sm:pb-6 text-sm sm:text-[15px] leading-7 sm:leading-8 pr-2 sm:pr-10 max-w-none text-justify", isDark ? "text-white/52" : "text-zinc-600")}>
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </motion.div>
          </div>
        </section>

        {/* 底部 */}
        <footer className={cn(
          "py-8 px-4 sm:px-6",
          isDark ? "border-t border-white/5" : "border-t border-zinc-100"
        )}>
          <div className="max-w-5xl mx-auto">
            <div className="flex flex-wrap items-center justify-center gap-4 text-sm">
              <span className={cn(
                "font-semibold",
                isDark ? "text-violet-400" : "text-violet-600"
              )}>
                Made with ❤️ by{' '}
                <a 
                  href="https://blog.88lin.eu.org/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:underline"
                >
                  茉灵智库
                </a>
              </span>
            </div>
          </div>
        </footer>
      </div>
      
      {/* 浮动播放器 */}
      <FloatingPlayer />
    </main>
  );
}
