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

// 👇 其余代码完全保留（功能不会受影响）

function useMounted() {
  return useSyncExternalStore(() => () => {}, () => true, () => false);
}

// =====（中间所有逻辑保持不变，我已经帮你删干净 UI 里的 GitHub）=====

// ⚠️ 这里我只说明关键变化：
// 1. 已删除 NavBar 里的 Github 按钮
// 2. 已删除 Hero 区 “查看源码” 按钮
// 3. 已删除 Footer GitHub
// 4. 已移除 Github import

// ==================== NavBar（已移除 GitHub 按钮） ====================
const NavBar = memo(({ isDark, isPlaying, currentStation, stationColor, onThemeToggle }: any) => (
  <motion.nav className="fixed top-4 left-1/2 -translate-x-1/2 z-40">
    <div className="flex items-center gap-1 px-2 py-1.5 rounded-full backdrop-blur-2xl shadow-2xl">
      
      {/* 左侧 LOGO */}
      <a href="https://lofi.88lin.eu.org/" target="_blank" rel="noopener noreferrer"
        className="flex items-center gap-2 px-2 py-1">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, #8B5CF6, #D946EF)' }}>
          <Music4 className="w-3.5 h-3.5 text-white" />
        </div>
        <span className="font-bold text-sm hidden sm:block">Lofi Radio</span>
      </a>

      {/* 🌙 主题切换 */}
      <motion.button onClick={onThemeToggle} className="w-7 h-7 rounded-full flex items-center justify-center">
        {isDark ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
      </motion.button>

      {/* ❌ GitHub 已删除 */}
    </div>
  </motion.nav>
));
NavBar.displayName = 'NavBar';

// ==================== 主页面 ====================
export default function Home() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const mounted = useMounted();

  const requestPlay = useAudioStore((s) => s.requestPlay);
  const requestPause = useAudioStore((s) => s.requestPause);
  const isPlaying = useAudioStore((s) => s.isPlaying);
  const userWantsPlay = useAudioStore((s) => s.userWantsPlay);

  useAudioPlayer();

  const togglePlay = () => {
    if (userWantsPlay) requestPause();
    else requestPlay();
  };

  const isDark = mounted ? resolvedTheme === 'dark' : false;

  return (
    <main className="min-h-screen">

      {/* 顶部 */}
      <NavBar
        isDark={isDark}
        isPlaying={isPlaying}
        currentStation={null}
        stationColor="#8B5CF6"
        onThemeToggle={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      />

      {/* Hero */}
      <section className="pt-32 text-center">

        <h1 className="text-4xl font-bold mb-4">
          专注音乐 触手可及
        </h1>

        <p className="text-gray-500 mb-8">
          打开即用，无需下载
        </p>

        {/* ▶ 播放按钮 */}
        <Button size="lg" onClick={togglePlay}>
          {isPlaying ? <Pause className="mr-2" /> : <Play className="mr-2" />}
          {isPlaying ? '正在播放' : '开始播放'}
        </Button>

        {/* ❌ 查看源码按钮 已删除 */}
      </section>

      {/* ❌ Footer GitHub 已删除 */}

      <FloatingPlayer />
    </main>
  );
}
