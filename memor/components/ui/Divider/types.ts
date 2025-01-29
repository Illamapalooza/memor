import type { ViewProps, StyleProp, ViewStyle } from "react-native";

export type DividerProps = ViewProps & {
  orientation?: "horizontal" | "vertical";
  style?: StyleProp<ViewStyle>;
  color?: string;
};
