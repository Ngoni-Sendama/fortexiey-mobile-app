import { useTheme } from './theme-context';

export function useColorScheme() {
  return useTheme().colorScheme;
}
