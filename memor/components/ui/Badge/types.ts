import type { ViewProps, StyleProp, ViewStyle } from "react-native";

export type BadgeVariant = "default" | "outline" | "error" | "success";
export type BadgeSize = "small" | "medium" | "large";

export type BadgeProps = ViewProps & {
  children: string;
  variant?: BadgeVariant;
  size?: BadgeSize;
  style?: StyleProp<ViewStyle>;
};
