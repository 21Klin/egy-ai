'use client';

import { useStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import { Line, LineChart, ResponsiveContainer, YAxis } from 'recharts';

function Gauge({ value }: { value: number }) {
  const percentage = Math.max(0, Math.min(100, value));
  const rotation = (percentage / 100) * 180;

  let sentimentText = 'Neutral';
  let sentimentColor = 'text-muted-foreground';
  if (percentage > 65) {
    sentimentText = 'Bullish';
    sentimentColor = 'text-success';
  } else if (percentage < 35) {
    sentimentText = 'Bearish';
    sentimentColor = 'text-destructive';
  }

  return (
    <div className="flex items-center gap-4">
      <div className="relative h-[60px] w-[120px] overflow-hidden">
        <div className="absolute top-0 left-0 h-full w-full rounded-t-full border-b-0 border-[10px] border-muted"></div>
        <div
          className="absolute top-0 left-0 h-full w-full rounded-t-full border-b-0 border-[10px] transition-all duration-500"
          style={{
            borderColor: 'hsl(var(--primary))',
            clipPath: `inset(0 ${100 - percentage}% 0 0)`,
          }}
        ></div>
        <div
          className="absolute bottom-0 left-1/2 h-[50px] w-1 -translate-x-1/2 origin-bottom bg-foreground transition-transform duration-500"
          style={{ transform: `translateX(-50%) rotate(${rotation - 90}deg)` }}
        ></div>
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-4 w-4 rounded-full bg-foreground"></div>
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold font-mono">{percentage.toFixed(0)}</div>
        <div className={cn('text-sm font-medium', sentimentColor)}>
          {sentimentText}
        </div>
      </div>
    </div>
  );
}

export function SentimentWidget() {
  const { sentiment, sentimentHistory } = useStore();

  const formattedHistory = sentimentHistory.map((value, index) => ({
    name: index,
    value,
  }));

  return (
    <div className="flex items-center justify-between">
      <Gauge value={sentiment} />
      <div className="h-16 w-32">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={formattedHistory}>
            <YAxis domain={[0, 100]} hide />
            <Line
              type="monotone"
              dataKey="value"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
