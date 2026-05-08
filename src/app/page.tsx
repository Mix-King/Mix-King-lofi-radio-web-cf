'use client';

import { useEffect, useSyncExternalStore, useCallback, memo, useState } from 'react';
import type { ReactNode } from 'react';
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
      <div className="flex items-center gap-2 mb-2">
        <div
          className="w-1.5 h-1.5 rounded-full"
          style={{
            background: isPlaying ? stationColor : (isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)'),
            boxShadow: isPlaying ? `0 0 6px ${stationColor}` : 'none',
            animation: isPlaying ? 'pulse 2s ease-in-out infinite' : 'none'
          }}
        />
        <span className={cn("text-xs font-medium tracking-widest uppercase", isDark ? "text-white/38" : "text-zinc-600")}>
          {clock.greeting}
        </span>
      </div>
      <div className="flex items-baseline gap-1.5">
        <span
          className="text-5xl sm:text-6xl font-bold tabular-nums tracking-tight"
          style={{
            backgroundImage: timeGradient,
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            color: 'transparent',
            fontVariantNumeric: 'tabular-nums'
          }}
        >
          {clock.h}:{clock.m}
        </span>
        <span
          className="text-2xl font-semibold tabular-nums self-end pb-1"
          style={{
            color: isDark ? `${stationColor}d6` : stationColor,
            textShadow: isDark ? `0 0 14px ${stationColor}40` : 'none'
          }}
        >
          {clock.s}
        </span>
      </div>
      <span className={cn("text-xs mt-1.5 tracking-wide", isDark ? "text-white/34" : "text-zinc-600")}>
        {clock.date}
      </span>
    </motion.div>
  );
});
LiveClock.displayName = 'LiveClock';

// ==================== 特性数据 ====================
const features = [
  { icon: Radio, title: `${stations.length} 精选电台`, description: '涵盖 Lo-Fi、Chill、Jazz、Classical 等多种音乐风格，适合学习、工作、阅读、放松等各种场景', color: '#8B5CF6', bg: 'rgba(139,92,246,0.08)' },
  { icon: Sparkles, title: '专注计时', description: '记录你的每日专注时长，帮助你培养高效工作习惯，让音乐陪伴你的专注时光', color: '#EC4899', bg: 'rgba(236,72,153,0.08)' },
  { icon: Waves, title: '在线收听', description: '无需下载安装，打开网页即可享受高品质音乐；灵动岛支持拖动，移动端双击可快速展开，支持快捷键、 PWA 离线使用', color: '#06B6D4', bg: 'rgba(6,182,212,0.08)' },
  { icon: Moon, title: '睡眠定时', description: '支持 15~120 分钟快速设置定时、1~480 分钟自定义定时，定时结束后自动自动暂停播放，安心入眠无需手动关闭', color: '#F59E0B', bg: 'rgba(245,158,11,0.08)' },
];

const scenes = [
  { id: '学习', icon: '📚', title: '学习', description: 'Lo-fi 音乐帮助你集中注意力', color: '#8B5CF6' },
  { id: '编程', icon: '💻', title: '编程', description: '氛围音乐激发创作灵感', color: '#06B6D4' },
  { id: '阅读', icon: '📖', title: '阅读', description: '轻柔爵士陪伴你的阅读时光', color: '#10B981' },
  { id: '助眠', icon: '🌙', title: '助眠', description: '自然白噪音帮助你入眠', color: '#F59E0B' },
];

const shortcuts = [
  { key: 'Space', label: '播放/暂停' },
  { key: '←', label: '上一首' },
  { key: '→', label: '下一首' },
  { key: 'M', label: '静音' },
  { key: 'T', label: '切换主题' },
];

const trustStats = [
  { label: '沉浸声场', value: '24/7', description: '全天候在线陪伴' },
  { label: '场景覆盖', value: `${stations.length}+`, description: '学习 / 编程 / 阅读 / 助眠' },
  { label: '极简操作', value: '1 Tap', description: '打开网页即可开始播放' },
];

const listeningModes = [
  { title: 'Focus Flow', description: '弱化干扰信息，让播放与专注状态成为主角。', color: '#8B5CF6' },
  { title: 'Soft Energy', description: '用轻亮的点缀色强化节奏感，但保持文字可读性。', color: '#06B6D4' },
  { title: 'Night Cocoon', description: '夜间氛围更柔和，降低刺眼高对比造成的疲劳。', color: '#EC4899' },
];

// 导航栏组件 - 药丸胶囊形式 + 高斯模糊
const NavBar = memo(({ isDark, isPlaying, currentStation, stationColor, onThemeToggle }: {
  isDark: boolean; isPlaying: boolean; currentStation: typeof stations[0] | null; stationColor: string; onThemeToggle: () => void;
}) => (
  <motion.nav
    className="fixed top-4 left-1/2 -translate-x-1/2 z-40"
    initial={{ y: -24, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    transition={{ duration: 0.5, ease: 'easeOut' }}
  >
    <div
      className={cn(
        "flex items-center gap-1 px-2 py-1.5 rounded-full backdrop-blur-2xl shadow-2xl",
        isDark ? "bg-zinc-900/65 border border-white/[0.09]" : "bg-white/75 border border-black/[0.05]"
      )}
      style={{ boxShadow: isDark ? '0 8px 32px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.07)' : '0 8px 32px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.9)' }}
    >
      <a href="https://lofi.88lin.eu.org/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-2 py-1 hover:opacity-80 transition-opacity">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #8B5CF6, #D946EF, #EC4899)', boxShadow: '0 2px 8px rgba(139,92,246,0.45)' }}>
          <Music4 className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-white" />
        </div>
        <span className={cn("font-bold text-sm hidden sm:block tracking-tight", isDark ? "text-white/90" : "text-zinc-900")}>Lofi Radio</span>
      </a>

      <div className={cn("w-px h-4 sm:h-5 mx-0.5", isDark ? "bg-white/10" : "bg-black/8")} />

      <AnimatePresence mode="wait">
        {isPlaying && currentStation ? (
          <motion.div key="playing" initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: 'auto' }} exit={{ opacity: 0, width: 0 }}
            className="flex items-center gap-1.5 px-2 py-1 rounded-full overflow-hidden" style={{ background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)' }}>
            <div className="flex items-end gap-0.5 h-3 flex-shrink-0">
              {[0, 1, 2].map((i) => (
                <div key={i} className="w-[2px] rounded-full animate-equalizer origin-bottom will-change-transform" style={{ background: stationColor, height: '12px', transform: 'scaleY(0.4)', animationDelay: `${i * 0.1}s` }} />
              ))}
            </div>
            <span className={cn("text-xs font-medium whitespace-nowrap max-w-[100px] truncate", isDark ? "text-white/65" : "text-zinc-600")}>{currentStation.name}</span>
          </motion.div>
        ) : (
          <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="px-2 py-1">
            <span className={cn("text-xs whitespace-nowrap", isDark ? "text-white/35" : "text-zinc-400")}>未播放</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className={cn("w-px h-4 sm:h-5 mx-0.5", isDark ? "bg-white/10" : "bg-black/8")} />

      <motion.button onClick={onThemeToggle}
        className={cn("w-7 h-7 rounded-full flex items-center justify-center transition-colors", isDark ? "text-white/60 hover:text-white hover:bg-white/10" : "text-zinc-500 hover:text-zinc-900 hover:bg-black/5")}
        whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} title={isDark ? '切换亮色' : '切换暗色'}>
        <AnimatePresence mode="wait">
          {isDark ? (
            <motion.div key="sun" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}><Sun className="w-3.5 h-3.5" /></motion.div>
          ) : (
            <motion.div key="moon" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}><Moon className="w-3.5 h-3.5" /></motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  </motion.nav>
));
NavBar.displayName = 'NavBar';

// 特性卡片组件
const FeatureCard = memo(({ feature, isDark }: { feature: typeof features[0]; isDark: boolean }) => (
  <motion.div
    variants={scaleIn}
    whileHover={{ y: -5, transition: { duration: 0.2 } }}
    className={cn(
      "relative p-5 rounded-2xl transition-all duration-300 overflow-hidden group cursor-default",
      isDark ? "bg-white/[0.03] hover:bg-white/[0.055] border border-white/[0.05]" : "bg-white hover:shadow-xl border border-black/[0.04]"
    )}
  >
    <div className="absolute top-0 left-0 right-0 h-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: `linear-gradient(90deg, transparent, ${feature.color}, transparent)` }} />
    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" style={{ background: `radial-gradient(ellipse at 50% 0%, ${feature.color}12 0%, transparent 65%)` }} />
    <div className="relative w-11 h-11 rounded-xl flex items-center justify-center mb-4" style={{ background: feature.bg, border: `1px solid ${feature.color}20` }}>
      <feature.icon className="w-5 h-5" style={{ color: feature.color }} />
    </div>
    <h3 className={cn("relative text-base font-semibold mb-1.5", isDark ? "text-white/90" : "text-zinc-900")}>{feature.title}</h3>
    <p className={cn("relative text-sm leading-relaxed", isDark ? "text-white/38" : "text-zinc-500")}>{feature.description}</p>
  </motion.div>
));
FeatureCard.displayName = 'FeatureCard';

// ==================== 场景卡片 ====================
const SceneCard = memo(({ scene, isDark, onClick }: { scene: typeof scenes[0]; isDark: boolean; onClick: () => void }) => (
  <motion.button
    variants={scaleIn}
    whileHover={{ y: -4, scale: 1.02 }}
    whileTap={{ scale: 0.97 }}
    onClick={onClick}
    className={cn(
      "relative p-5 rounded-2xl text-center transition-all cursor-pointer w-full overflow-hidden group",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500",
      isDark ? "bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.05]" : "bg-white shadow-sm hover:shadow-lg border border-black/[0.04]"
    )}
  >
    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" style={{ background: `radial-gradient(ellipse at 50% 100%, ${scene.color}12 0%, transparent 65%)` }} />
    <div className="text-3xl mb-3 relative">{scene.icon}</div>
    <h4 className={cn("font-semibold text-sm mb-1 relative", isDark ? "text-white/90" : "text-zinc-900")}>{scene.title}</h4>
    <p className={cn("text-xs leading-relaxed relative", isDark ? "text-white/38" : "text-zinc-500")}>{scene.description}</p>
  </motion.button>
));
SceneCard.displayName = 'SceneCard';

// 电台卡片组件 - 使用 button 提升可访问性
const StationCard = memo(({ station, isDark, isActive, isPlaying, onClick }: {
  station: typeof stations[0]; isDark: boolean; isActive: boolean; isPlaying: boolean; onClick: () => void;
}) => (
  <motion.button
    variants={scaleIn}
    whileHover={{ y: -3, scale: 1.01 }}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    className={cn(
      "relative p-4 rounded-xl cursor-pointer overflow-hidden group w-full text-left",
      "focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2",
      isDark ? "bg-white/[0.03] hover:bg-white/[0.05] focus-visible:ring-offset-zinc-950" : "bg-white hover:shadow-lg focus-visible:ring-offset-gray-50"
    )}
    style={{ borderLeft: `3px solid ${isActive ? station.color : 'transparent'}` }}
  >
    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" style={{ background: `linear-gradient(135deg, ${station.color}09 0%, transparent 55%)` }} />
    <div className="relative flex items-center gap-3">
      <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 relative" style={{ background: `${station.color}18` }}>
        {isActive && isPlaying ? (
          <div className="flex items-end gap-0.5 h-4">
            {[0, 1, 2].map((i) => (
              <div key={i} className="w-[2px] rounded-full animate-equalizer origin-bottom will-change-transform" style={{ background: station.color, height: '14px', transform: 'scaleY(0.4)', animationDelay: `${i * 0.12}s` }} />
            ))}
          </div>
        ) : (
          <Waves className="w-4 h-4 transition-transform group-hover:scale-110" style={{ color: station.color }} />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <h4 className={cn("text-sm font-semibold truncate transition-colors", isActive ? "" : isDark ? "text-white/80 group-hover:text-white/95" : "text-zinc-800")} style={isActive ? { color: station.color } : {}}>
          {station.name}
        </h4>
        <div className="flex items-center gap-1 mt-0.5">
          <span className={cn("text-xs", isDark ? "text-white/30" : "text-zinc-400")}>{station.style1}</span>
          {station.custom && (
            <>
              <span className={cn("text-xs", isDark ? "text-white/15" : "text-zinc-300")}>·</span>
              <span className="text-[10px] font-medium" style={{ color: `${station.color}bb` }}>{station.custom}</span>
            </>
          )}
        </div>
      </div>
      {isActive && (
        <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: station.color, boxShadow: `0 0 6px ${station.color}`, animation: isPlaying ? 'pulse 1.5s ease-in-out infinite' : 'none' }} />
      )}
    </div>
  </motion.button>
));
StationCard.displayName = 'StationCard';

const AmbientOrb = memo(({ className, color, blur = 80 }: { className: string; color: string; blur?: number }) => (
  <div
    className={cn('absolute rounded-full pointer-events-none', className)}
    style={{
      background: `radial-gradient(circle, ${color} 0%, transparent 68%)`,
      filter: `blur(${blur}px)`,
      opacity: 0.65,
    }}
  />
));
AmbientOrb.displayName = 'AmbientOrb';

const GlassPanel = memo(({ isDark, className, children }: { isDark: boolean; className?: string; children: ReactNode }) => (
  <div
    className={cn(
      'relative overflow-hidden border backdrop-blur-2xl',
      isDark
        ? 'bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.025))] border-white/[0.08]'
        : 'bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(255,255,255,0.72))] border-black/[0.06]',
      className,
    )}
    style={{
      boxShadow: isDark
        ? '0 24px 120px rgba(0,0,0,0.38), inset 0 1px 0 rgba(255,255,255,0.06)'
        : '0 24px 90px rgba(15,23,42,0.08), inset 0 1px 0 rgba(255,255,255,0.95)',
    }}
  >
    {children}
  </div>
));
GlassPanel.displayName = 'GlassPanel';

// ==================== 主页 ====================
export default function Home() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const mounted = useMounted();
  const [showMobileHint, setShowMobileHint] = useState(false);

  const requestPlay = useAudioStore((s) => s.requestPlay);
  const requestPause = useAudioStore((s) => s.requestPause);
  const nextStation = useAudioStore((s) => s.nextStation);
  const prevStation = useAudioStore((s) => s.prevStation);
  const toggleMute = useAudioStore((s) => s.toggleMute);
  const isPlaying = useAudioStore((s) => s.isPlaying);
  const isLoading = useAudioStore((s) => s.isLoading);
  const userWantsPlay = useAudioStore((s) => s.userWantsPlay);
  const currentStation = useAudioStore((s) => s.currentStation);
  const setMiniMode = useAudioStore((s) => s.setMiniMode);
  const selectStationById = useAudioStore((s) => s.selectStationById);
  const setSelectedCategory = useAudioStore((s) => s.setSelectedCategory);
  const { focusTime } = useFocusTimer();
  const { remainingSeconds } = useSleepTimer();

  useAudioPlayer();

  const handleStationClick = useCallback((id: string) => { selectStationById(id); setMiniMode(false); }, [selectStationById, setMiniMode]);
  const handleSceneClick = useCallback((sceneId: string) => {
    const s = stations.filter(s => s.scene === sceneId);
    if (s.length > 0) { setSelectedCategory(sceneId); selectStationById(s[0].id); setMiniMode(false); }
  }, [selectStationById, setMiniMode, setSelectedCategory]);
  const handleThemeToggle = useCallback(() => { setTheme(theme === 'dark' ? 'light' : 'dark'); }, [theme, setTheme]);
  const togglePlay = useCallback(() => { if (userWantsPlay) requestPause(); else requestPlay(); }, [userWantsPlay, requestPlay, requestPause]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      switch (e.code) {
        case 'Space': e.preventDefault(); togglePlay(); break;
        case 'ArrowLeft': e.preventDefault(); prevStation(); break;
        case 'ArrowRight': e.preventDefault(); nextStation(); break;
        case 'KeyM': e.preventDefault(); toggleMute(); break;
        case 'KeyT': e.preventDefault(); handleThemeToggle(); break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleThemeToggle, togglePlay, nextStation, prevStation, toggleMute]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    let showRafId: number | null = null;
    let hideTimer: number | null = null;

    try {
      const dismissed = window.localStorage.getItem(MOBILE_ISLAND_HINT_DISMISSED_KEY) === '1';
      if (dismissed) {
        return;
      }
    } catch {
      // ignore localStorage access errors
    }

    showRafId = window.requestAnimationFrame(() => {
      setShowMobileHint(true);
    });

    hideTimer = window.setTimeout(() => {
      setShowMobileHint(false);
    }, 30000);

    const handleIslandExpanded = () => {
      setShowMobileHint(false);
      try {
        window.localStorage.setItem(MOBILE_ISLAND_HINT_DISMISSED_KEY, '1');
      } catch {
        // ignore localStorage access errors
      }
    };

    window.addEventListener(MOBILE_ISLAND_EXPAND_LEARNED_EVENT, handleIslandExpanded);

    return () => {
      if (showRafId !== null) window.cancelAnimationFrame(showRafId);
      if (hideTimer !== null) window.clearTimeout(hideTimer);
      window.removeEventListener(MOBILE_ISLAND_EXPAND_LEARNED_EVENT, handleIslandExpanded);
    };
  }, []);

  const isDark = mounted ? resolvedTheme === 'dark' : false;
  const stationColor = currentStation?.color || '#8B5CF6';

  // Update theme-color meta tag for iOS PWA navigation bar
  useEffect(() => {
    if (!mounted) return;
    let meta = document.querySelector('meta[name="theme-color"]') as HTMLMetaElement | null;
    if (!meta) {
      meta = document.createElement('meta');
      meta.name = 'theme-color';
      document.head.appendChild(meta);
    }
    meta.content = isDark ? '#0a0a0c' : '#f8fafc';
  }, [isDark, mounted]);

  return (
    <main className="relative min-h-screen overflow-x-hidden">
      {/* 背景 */}
      <div className="fixed inset-0 -z-10 pointer-events-none">
        {/* 基础底色 */}
        <div className={cn("absolute inset-0 transition-colors duration-700", isDark ? "bg-[#0a0a0c]" : "bg-slate-50")} />
        
        {/* 静态柔和渐变 */}
        <div 
          className="absolute inset-0 opacity-40 sm:opacity-50"
          style={{
            background: isDark 
              ? 'radial-gradient(circle at 15% 10%, rgba(139, 92, 246, 0.15) 0%, transparent 40%), radial-gradient(circle at 75% 60%, rgba(6, 182, 212, 0.12) 0%, transparent 45%), radial-gradient(circle at 30% 85%, rgba(236, 72, 153, 0.12) 0%, transparent 40%)'
              : 'radial-gradient(circle at 15% 10%, rgba(139, 92, 246, 0.08) 0%, transparent 40%), radial-gradient(circle at 75% 60%, rgba(6, 182, 212, 0.06) 0%, transparent 45%), radial-gradient(circle at 30% 85%, rgba(236, 72, 153, 0.06) 0%, transparent 40%)'
          }}
        />

        {/* 高级噪点质感 */}
        <div 
          className="absolute inset-0 opacity-[0.03] sm:opacity-[0.04]"
          style={{ 
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
            mixBlendMode: isDark ? 'overlay' : 'multiply'
          }} 
        />
        <div className="absolute inset-0" style={{
          backgroundImage: `linear-gradient(${isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)'} 1px, transparent 1px), linear-gradient(90deg, ${isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)'} 1px, transparent 1px)`,
          backgroundSize: '64px 64px', opacity: 0.4,
        }} />
      </div>

      {/* 内容 */}
      <div className="relative z-10">
        <NavBar isDark={isDark} isPlaying={isPlaying} currentStation={currentStation} stationColor={stationColor} onThemeToggle={handleThemeToggle} />

        {/* Hero Section */}
        <section className="pt-22 pb-10 sm:pb-14 px-4 sm:px-6">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div initial="hidden" animate="visible" variants={stagger}>

              {/* 标签 */}
              <motion.div variants={fadeInUp} className="mb-6">
                <a href="https://lofi.88lin.eu.org/" target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium cursor-pointer transition-all hover:scale-105"
                  style={{
                    background: isDark ? 'rgba(139,92,246,0.12)' : 'rgba(139,92,246,0.07)',
                    color: isDark ? '#c4b5fd' : '#6d28d9',
                    border: isDark ? '1px solid rgba(139,92,246,0.25)' : '1px solid rgba(139,92,246,0.15)',
                  }}>
                  <Sparkles className="w-3.5 h-3.5" />
                  网页版全新上线
                  <ExternalLink className="w-3 h-3 opacity-50" />
                </a>
              </motion.div>

              <motion.div variants={fadeInUp} className="relative mt-2 sm:mt-4">
                <GlassPanel isDark={isDark} className="rounded-[32px] sm:rounded-[40px] p-5 sm:p-8 md:p-10 text-left">
                  <AmbientOrb className="-top-12 -left-10 w-40 h-40 sm:w-56 sm:h-56" color={`${stationColor}55`} />
                  <AmbientOrb className="top-10 -right-10 w-36 h-36 sm:w-52 sm:h-52" color={isDark ? 'rgba(236,72,153,0.36)' : 'rgba(125,211,252,0.45)'} blur={90} />
                  <AmbientOrb className="-bottom-16 left-1/3 w-44 h-44 sm:w-60 sm:h-60" color={isDark ? 'rgba(6,182,212,0.28)' : 'rgba(196,181,253,0.50)'} blur={110} />

                  <div className="relative grid gap-8 lg:grid-cols-[1.25fr_0.75fr] lg:items-center">
                    <div>
                      <div className="flex flex-wrap items-center gap-3 mb-5">
                        <div className="inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-[11px] sm:text-xs font-semibold tracking-[0.16em] uppercase"
                          style={{
                            background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.7)',
                            color: isDark ? 'rgba(255,255,255,0.76)' : '#4c1d95',
                            border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(139,92,246,0.12)',
                          }}>
                          <Sparkles className="w-3.5 h-3.5" />
                          Impeccable 风格重构中
                        </div>
                        <a href="https://lofi.88lin.eu.org/" target="_blank" rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-[11px] sm:text-xs font-medium transition-all hover:scale-[1.02]"
                          style={{
                            background: isDark ? 'rgba(139,92,246,0.12)' : 'rgba(139,92,246,0.08)',
                            color: isDark ? '#ddd6fe' : '#6d28d9',
                            border: isDark ? '1px solid rgba(139,92,246,0.24)' : '1px solid rgba(139,92,246,0.14)',
                          }}>
                          网页版已上线
                          <ExternalLink className="w-3 h-3 opacity-70" />
                        </a>
                      </div>

                      <motion.h1 variants={fadeInUp} className="text-4xl sm:text-5xl md:text-6xl lg:text-[72px] font-bold leading-[0.98] tracking-[-0.04em] mb-5 text-center sm:text-left">
                        <span className={cn(
                          'bg-clip-text text-transparent',
                          isDark
                            ? 'bg-[linear-gradient(135deg,#faf5ff_0%,#c4b5fd_28%,#7dd3fc_62%,#f9a8d4_100%)]'
                            : 'bg-[linear-gradient(135deg,#18181b_0%,#6d28d9_40%,#0f766e_100%)]'
                        )}>
                          让专注听感
                          <br className="hidden sm:block" />
                          变得更安静、更高级
                        </span>
                      </motion.h1>

                      <motion.p variants={fadeInUp} className={cn('text-[15px] sm:text-lg md:text-xl max-w-2xl leading-8 sm:leading-9 mb-7 text-center sm:text-left', isDark ? 'text-white/58' : 'text-zinc-600')}>
                        不改动播放、计时、电台切换这些核心能力，只针对界面层做精修。
                        <br className="hidden sm:block" />
                        基于 Impeccable 提倡的节奏、留白、对比和克制动效，把当前页面打磨成更耐看、更像成品的状态。
                      </motion.p>

                      <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-7">
                        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full sm:w-auto">
                          <Button size="lg" onClick={() => togglePlay()}
                            className="w-full sm:w-52 rounded-full px-10 h-12 text-base font-semibold shadow-xl flex items-center justify-center border-0"
                            style={{ background: 'linear-gradient(135deg, #8B5CF6, #D946EF)', boxShadow: '0 12px 40px rgba(139,92,246,0.30)' }}>
                            {isPlaying ? <><Pause className="w-5 h-5 mr-2" /><span>正在播放</span></> : <><Play className="w-5 h-5 mr-2" /><span>开始播放</span></>}
                          </Button>
                        </motion.div>
                        <div className={cn('flex items-center justify-center sm:justify-start gap-2 text-sm', isDark ? 'text-white/40' : 'text-zinc-500')}>
                          <div className="w-2 h-2 rounded-full" style={{ background: stationColor, boxShadow: `0 0 14px ${stationColor}` }} />
                          <span>当前主题色跟随电台变化，播放器逻辑保持不变</span>
                        </div>
                      </motion.div>

                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7, duration: 0.5 }} className="hidden sm:flex flex-wrap gap-2.5">
                        {shortcuts.map((item, i) => (
                          <div key={i} className={cn('inline-flex items-center gap-2 px-3 py-2 rounded-2xl', isDark ? 'bg-white/[0.035] border border-white/[0.06]' : 'bg-white/70 border border-black/[0.05]')}>
                            <kbd className={cn('px-2 py-0.5 rounded-md text-xs font-mono font-semibold', isDark ? 'bg-white/10 text-white/60 border border-white/10' : 'bg-black/5 text-zinc-600 border border-black/8')}>{item.key}</kbd>
                            <span className={cn('text-xs', isDark ? 'text-white/40' : 'text-zinc-500')}>{item.label}</span>
                          </div>
                        ))}
                      </motion.div>
                    </div>

                    <div className="relative flex flex-col gap-4">
                      <div className="flex justify-center lg:justify-end">
                        <LiveClock isDark={isDark} stationColor={stationColor} isPlaying={isPlaying} />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-3">
                        {trustStats.map((item) => (
                          <div key={item.label} className={cn('rounded-[24px] p-4 text-left', isDark ? 'bg-white/[0.04] border border-white/[0.06]' : 'bg-white/72 border border-black/[0.05]')}>
                            <div className={cn('text-[11px] uppercase tracking-[0.18em] mb-2', isDark ? 'text-white/34' : 'text-zinc-400')}>{item.label}</div>
                            <div className={cn('text-2xl font-semibold tracking-tight mb-1', isDark ? 'text-white' : 'text-zinc-900')}>{item.value}</div>
                            <div className={cn('text-xs leading-5', isDark ? 'text-white/44' : 'text-zinc-500')}>{item.description}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </GlassPanel>
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
            <motion.div initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="mb-6 sm:mb-8">
              <GlassPanel isDark={isDark} className="rounded-[28px] p-4 sm:p-5">
                <div className="grid gap-3 md:grid-cols-3">
                  {listeningModes.map((mode) => (
                    <div key={mode.title} className={cn('rounded-3xl p-4', isDark ? 'bg-white/[0.03]' : 'bg-black/[0.02]')}>
                      <div className="w-10 h-1.5 rounded-full mb-4" style={{ background: `linear-gradient(90deg, ${mode.color}, transparent)` }} />
                      <h3 className={cn('text-sm sm:text-base font-semibold mb-2', isDark ? 'text-white/92' : 'text-zinc-900')}>{mode.title}</h3>
                      <p className={cn('text-xs sm:text-sm leading-6', isDark ? 'text-white/44' : 'text-zinc-500')}>{mode.description}</p>
                    </div>
                  ))}
                </div>
              </GlassPanel>
            </motion.div>

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
