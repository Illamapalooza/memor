import type {
  TextProps as RNTextProps,
  StyleProp,
  TextStyle,
} from "react-native";

export type TextVariant =
  | "h1"
  | "h2"
  | "h3"
  | "subtitle1"
  | "subtitle2"
  | "body"
  | "bodySmall"
  | "caption";

export type TextProps = RNTextProps & {
  variant?: TextVariant;
  color?: string;
  align?: "auto" | "left" | "right" | "center" | "justify";
  children: React.ReactNode;
  style?: StyleProp<TextStyle>;
};
