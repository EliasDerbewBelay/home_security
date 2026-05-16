import React from 'react';
import { View, Text, Dimensions } from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop } from 'react-native-svg';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const ActivityChart = () => {
  // Mock data for the smooth curve
  const data = [100, 120, 110, 150, 130, 180, 140, 220, 160];
  const chartWidth = Math.max(0, SCREEN_WIDTH - 64); // Padding
  const chartHeight = 120;
  
  // Simple smooth curve calculation
  const points = data.map((val, i) => ({
    x: (i / (data.length - 1)) * chartWidth,
    y: chartHeight - (val / 250) * chartHeight
  }));

  const d = `M ${points[0].x} ${points[0].y} ` + 
    points.map((p, i) => {
      if (i === 0) return '';
      const prev = points[i - 1];
      const cp1x = prev.x + (p.x - prev.x) / 2;
      return `C ${cp1x} ${prev.y}, ${cp1x} ${p.y}, ${p.x} ${p.y}`;
    }).join(' ');

  const areaD = `${d} L ${chartWidth} ${chartHeight} L 0 ${chartHeight} Z`;

  return (
    <View className="mt-4">
      <Svg width={chartWidth} height={chartHeight}>
        <Defs>
          <LinearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#00E676" stopOpacity="0.4" />
            <Stop offset="1" stopColor="#00E676" stopOpacity="0" />
          </LinearGradient>
        </Defs>
        <Path d={areaD} fill="url(#grad)" />
        <Path d={d} stroke="#00E676" strokeWidth="3" fill="none" />
      </Svg>
      <View className="flex-row justify-between mt-2">
        <Text className="text-white/40 text-[10px] font-bold">18:00</Text>
        <Text className="text-white/40 text-[10px] font-bold">18:30</Text>
        <Text className="text-white/40 text-[10px] font-bold">19:00</Text>
      </View>
    </View>
  );
};
