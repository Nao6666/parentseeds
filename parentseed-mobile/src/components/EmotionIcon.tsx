import React from 'react';
import Svg, { Path, Circle } from 'react-native-svg';

interface EmotionIconProps {
  emotion: string;
  size?: number;
  color?: string;
}

// 喜び - 笑顔
function JoyIcon({ size, color }: { size: number; color: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={12} r={10} stroke={color} strokeWidth={2} />
      <Path d="M8 14s1.5 2 4 2 4-2 4-2" stroke={color} strokeWidth={2} strokeLinecap="round" />
      <Circle cx={9} cy={9} r={1.5} fill={color} />
      <Circle cx={15} cy={9} r={1.5} fill={color} />
    </Svg>
  );
}

// 信頼 - ハートと手
function TrustIcon({ size, color }: { size: number; color: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M12 21C12 21 4 15 4 9.5C4 7 6 5 8.5 5C10 5 11.5 6 12 7.5C12.5 6 14 5 15.5 5C18 5 20 7 20 9.5C20 15 12 21 12 21Z" stroke={color} strokeWidth={2} strokeLinejoin="round" />
      <Path d="M7 3V5M17 3V5M12 1V3" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
    </Svg>
  );
}

// 恐れ - 震えるシールド
function FearIcon({ size, color }: { size: number; color: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M12 2L4 6V12C4 17 8 20.5 12 22C16 20.5 20 17 20 12V6L12 2Z" stroke={color} strokeWidth={2} strokeLinejoin="round" />
      <Path d="M12 8V13" stroke={color} strokeWidth={2} strokeLinecap="round" />
      <Circle cx={12} cy={16} r={1} fill={color} />
    </Svg>
  );
}

// 驚き - スターバースト
function SurpriseIcon({ size, color }: { size: number; color: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M12 2L14.5 8.5L21 9.5L16 14L17.5 21L12 17.5L6.5 21L8 14L3 9.5L9.5 8.5L12 2Z" stroke={color} strokeWidth={2} strokeLinejoin="round" />
      <Circle cx={12} cy={12} r={2} fill={color} />
    </Svg>
  );
}

// 悲しみ - 涙
function SadnessIcon({ size, color }: { size: number; color: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={12} r={10} stroke={color} strokeWidth={2} />
      <Path d="M8 16C8 16 9.5 14 12 14C14.5 14 16 16 16 16" stroke={color} strokeWidth={2} strokeLinecap="round" />
      <Circle cx={9} cy={9} r={1.5} fill={color} />
      <Circle cx={15} cy={9} r={1.5} fill={color} />
      <Path d="M16 4L17 7" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
    </Svg>
  );
}

// 嫌悪 - しかめっ面
function DisgustIcon({ size, color }: { size: number; color: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={12} r={10} stroke={color} strokeWidth={2} />
      <Path d="M8 15.5C8 15.5 10 14 12 15C14 14 16 15.5 16 15.5" stroke={color} strokeWidth={2} strokeLinecap="round" />
      <Path d="M7 8L10 9.5" stroke={color} strokeWidth={2} strokeLinecap="round" />
      <Path d="M17 8L14 9.5" stroke={color} strokeWidth={2} strokeLinecap="round" />
      <Circle cx={9} cy={10.5} r={1} fill={color} />
      <Circle cx={15} cy={10.5} r={1} fill={color} />
    </Svg>
  );
}

// 怒り - 炎
function AngerIcon({ size, color }: { size: number; color: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M12 22C8 22 5 19 5 15C5 11 8 8 9 6C9.5 8 11 9 12 9C11 7 11 4 13 2C14 5 17 7 17 11C18 11 19 10 19 10C19 10 19 19 12 22Z" stroke={color} strokeWidth={2} strokeLinejoin="round" />
      <Path d="M10 17C10 18.1 10.9 19 12 19C13.1 19 14 18.1 14 17C14 15.5 12 14 12 14C12 14 10 15.5 10 17Z" fill={color} />
    </Svg>
  );
}

// 期待 - 日の出
function AnticipationIcon({ size, color }: { size: number; color: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M12 2V5" stroke={color} strokeWidth={2} strokeLinecap="round" />
      <Path d="M4.93 4.93L7.05 7.05" stroke={color} strokeWidth={2} strokeLinecap="round" />
      <Path d="M19.07 4.93L16.95 7.05" stroke={color} strokeWidth={2} strokeLinecap="round" />
      <Path d="M2 15H22" stroke={color} strokeWidth={2} strokeLinecap="round" />
      <Path d="M5 15C5 11.13 8.13 8 12 8C15.87 8 19 11.13 19 15" stroke={color} strokeWidth={2} />
      <Path d="M3 19H21" stroke={color} strokeWidth={2} strokeLinecap="round" />
    </Svg>
  );
}

const iconComponents: Record<string, React.FC<{ size: number; color: string }>> = {
  喜び: JoyIcon,
  信頼: TrustIcon,
  恐れ: FearIcon,
  驚き: SurpriseIcon,
  悲しみ: SadnessIcon,
  嫌悪: DisgustIcon,
  怒り: AngerIcon,
  期待: AnticipationIcon,
};

export default function EmotionIcon({ emotion, size = 24, color = '#000' }: EmotionIconProps) {
  const IconComponent = iconComponents[emotion];
  if (!IconComponent) return null;
  return <IconComponent size={size} color={color} />;
}

export { iconComponents };
