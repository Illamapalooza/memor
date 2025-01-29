import { PressableProps, StyleProp, ViewStyle, TextStyle } from "react-native";
import { ReactNode } from "react";

export type BaseButtonProps = PressableProps & {
  children: string | ReactNode;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  size?: "small" | "medium" | "large";
};
