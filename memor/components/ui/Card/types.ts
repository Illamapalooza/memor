import type {
  ViewProps,
  PressableProps,
  StyleProp,
  ViewStyle,
} from "react-native";

export type CardProps = (ViewProps | PressableProps) & {
  children: React.ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  elevation?: 0 | 1 | 2 | 3 | 4 | 5;
};
