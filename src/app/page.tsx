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

export default function Home() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const { isPlaying, togglePlay, currentStation } = useAudioPlayer();
  const { focusTime } = useFocusTimer();
  const { remainingSeconds } = useSleepTimer();

  const stationColor = currentStation?.color || '#8B5CF6';

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-white to-gray-100 text-black px-4">

      {/* 顶部标题（优化间距） */}
      <motion.div className="mb-8 flex items-center gap-3 bg-white/80 backdrop-blur px-6 py-3 rounded-full shadow">
        <span className="text-lg font-semibold">🎧 Lofi Radio</span>
        <span className="text-gray-500">🌙</span>
      </motion.div>

      {/* 主卡片（UI优化） */}
      <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-md flex flex-col items-center">

        <div className="w-20 h-20 rounded-full bg-gradient-to-r from-purple-400 to-indigo-500 flex items-center justify-center text-white text-2xl shadow mb-4">
          ▶
        </div>

        <h2 className="text-xl font-bold mb-1">Lofi Girl</h2>
        <p className="text-gray-500 text-sm mb-6">Chill beats to relax/study</p>

        <Button
          onClick={togglePlay}
          className="px-6 py-3 bg-purple-500 hover:bg-purple-600 transition text-white rounded-full shadow"
        >
          {isPlaying ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
          {isPlaying ? '暂停' : '播放'}
        </Button>
      </div>

      {/* 标题优化（更紧凑） */}
      <h1 className="text-3xl font-bold mt-10 mb-2 text-center">
        专注音乐 触手可及
      </h1>

      <p className="text-gray-500 mb-6 text-center">
        打开即用 · 无需下载 · 沉浸体验
      </p>

      {/* 删除 GitHub UI（已清理） */}

      {/* 浮动播放器 */}
      <FloatingPlayer />

    </main>
  );
}
