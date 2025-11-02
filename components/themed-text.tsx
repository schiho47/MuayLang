import { Text, type TextProps } from 'react-native'

import { useThemeColor } from '@/hooks/use-theme-color'

export type ThemedTextProps = TextProps & {
  lightColor?: string
  darkColor?: string
  type?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link'
}

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = 'default',
  className,
  ...rest
}: ThemedTextProps & { className?: string }) {
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text')

  const getTypeStyles = () => {
    switch (type) {
      case 'title':
        return { fontSize: 32, fontWeight: 'bold' as const, lineHeight: 32 }
      case 'defaultSemiBold':
        return { fontSize: 16, lineHeight: 24, fontWeight: '600' as const }
      case 'subtitle':
        return { fontSize: 20, fontWeight: 'bold' as const }
      case 'link':
        return { lineHeight: 30, fontSize: 16, color: '#0a7ea4' }
      default:
        return { fontSize: 16, lineHeight: 24 }
    }
  }

  return <Text className={className} style={[{ color }, getTypeStyles(), style]} {...rest} />
}
