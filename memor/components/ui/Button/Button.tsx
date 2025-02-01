import React from "react";
import { StyleSheet, Pressable, View } from "react-native";
import { Text, ActivityIndicator } from "react-native-paper";
import { useAppTheme } from "@/hooks/useAppTheme";
import { BaseButtonProps } from "./types";

const getSizeStyles = (size: BaseButtonProps["size"] = "medium") => {
  switch (size) {
    case "small":
      return {
        paddingVertical: 6,
        paddingHorizontal: 12,
        fontSize: 14,
      };
    case "large":
      return {
        paddingVertical: 14,
        paddingHorizontal: 24,
        fontSize: 18,
      };
    default:
      return {
        paddingVertical: 10,
        paddingHorizontal: 16,
        fontSize: 16,
      };
  }
};

export function PrimaryButton({
  children,
  disabled,
  loading,
  style,
  textStyle,
  size,
  fullWidth,
  ...props
}: BaseButtonProps) {
  const theme = useAppTheme();
  const sizeStyles = getSizeStyles(size);

  return (
    <Pressable
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: disabled
            ? theme.colors.surfaceDisabled
            : theme.colors.primary,
          opacity: pressed ? 0.8 : 1,
          paddingVertical: sizeStyles.paddingVertical,
          paddingHorizontal: sizeStyles.paddingHorizontal,
          width: fullWidth ? "100%" : "auto",
        },
        style,
      ]}
      {...props}
    >
      {loading ? (
        <ActivityIndicator
          color={theme.colors.surface}
          size={sizeStyles.fontSize}
        />
      ) : (
        <Text
          style={[
            styles.text,
            {
              color: disabled
                ? theme.colors.onSurfaceDisabled
                : theme.colors.surface,
              fontSize: sizeStyles.fontSize,
            },
            textStyle,
          ]}
        >
          {children}
        </Text>
      )}
    </Pressable>
  );
}

export function OutlineButton({
  children,
  disabled,
  loading,
  style,
  textStyle,
  size,
  fullWidth,
  ...props
}: BaseButtonProps) {
  const theme = useAppTheme();
  const sizeStyles = getSizeStyles(size);

  return (
    <Pressable
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: "transparent",
          borderWidth: 1,
          borderColor: disabled
            ? theme.colors.surfaceDisabled
            : theme.colors.primary,
          opacity: pressed ? 0.8 : 1,
          paddingVertical: sizeStyles.paddingVertical,
          paddingHorizontal: sizeStyles.paddingHorizontal,
          width: fullWidth ? "100%" : "auto",
        },
        style,
      ]}
      {...props}
    >
      {loading ? (
        <ActivityIndicator
          color={theme.colors.primary}
          size={sizeStyles.fontSize}
        />
      ) : (
        <Text
          style={[
            styles.text,
            {
              color: disabled
                ? theme.colors.onSurfaceDisabled
                : theme.colors.primary,
              fontSize: sizeStyles.fontSize,
            },
            textStyle,
          ]}
        >
          {children}
        </Text>
      )}
    </Pressable>
  );
}

export function GhostButton({
  children,
  disabled,
  loading,
  style,
  textStyle,
  size,
  fullWidth,
  ...props
}: BaseButtonProps) {
  const theme = useAppTheme();
  const sizeStyles = getSizeStyles(size);

  return (
    <Pressable
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: pressed
            ? theme.colors.surfaceVariant
            : "transparent",
          paddingVertical: sizeStyles.paddingVertical,
          paddingHorizontal: sizeStyles.paddingHorizontal,
          width: fullWidth ? "100%" : "auto",
        },
        style,
      ]}
      {...props}
    >
      {loading ? (
        <ActivityIndicator
          color={theme.colors.primary}
          size={sizeStyles.fontSize}
        />
      ) : (
        <Text
          style={[
            styles.text,
            {
              color: disabled
                ? theme.colors.onSurfaceDisabled
                : theme.colors.primary,
              fontSize: sizeStyles.fontSize,
            },
            textStyle,
          ]}
        >
          {children}
        </Text>
      )}
    </Pressable>
  );
}

export function LinkButton({
  children,
  disabled,
  loading,
  style,
  textStyle,
  size,
  ...props
}: BaseButtonProps) {
  const theme = useAppTheme();
  const sizeStyles = getSizeStyles(size);

  return (
    <Pressable
      disabled={disabled || loading}
      style={({ pressed }) => [
        {
          opacity: pressed ? 0.8 : 1,
        },
        style,
      ]}
      {...props}
    >
      {loading ? (
        <ActivityIndicator
          color={theme.colors.primary}
          size={sizeStyles.fontSize}
        />
      ) : (
        <Text
          style={[
            styles.text,
            {
              color: disabled
                ? theme.colors.onSurfaceDisabled
                : theme.colors.primary,
              fontSize: sizeStyles.fontSize,
              textDecorationLine: "underline",
            },
            textStyle,
          ]}
        >
          {children}
        </Text>
      )}
    </Pressable>
  );
}

export function SecondaryButton({
  children,
  disabled,
  loading,
  style,
  textStyle,
  size,
  fullWidth,
  ...props
}: BaseButtonProps) {
  const theme = useAppTheme();
  const sizeStyles = getSizeStyles(size);

  return (
    <Pressable
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: disabled
            ? theme.colors.surfaceDisabled
            : theme.colors.secondary,
          opacity: pressed ? 0.8 : 1,
          paddingVertical: sizeStyles.paddingVertical,
          paddingHorizontal: sizeStyles.paddingHorizontal,
          width: fullWidth ? "100%" : "auto",
        },
        style,
      ]}
      {...props}
    >
      {loading ? (
        <ActivityIndicator
          color={theme.colors.surface}
          size={sizeStyles.fontSize}
        />
      ) : (
        <Text
          style={[
            styles.text,
            {
              color: disabled
                ? theme.colors.onSurfaceDisabled
                : theme.colors.surface,
              fontSize: sizeStyles.fontSize,
            },
            textStyle,
          ]}
        >
          {children}
        </Text>
      )}
    </Pressable>
  );
}

export function DestructiveButton({
  children,
  disabled,
  loading,
  style,
  textStyle,
  size,
  fullWidth,
  ...props
}: BaseButtonProps) {
  const theme = useAppTheme();
  const sizeStyles = getSizeStyles(size);

  return (
    <Pressable
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: disabled
            ? theme.colors.surfaceDisabled
            : theme.colors.error,
          opacity: pressed ? 0.8 : 1,
          paddingVertical: sizeStyles.paddingVertical,
          paddingHorizontal: sizeStyles.paddingHorizontal,
          width: fullWidth ? "100%" : "auto",
        },
        style,
      ]}
      {...props}
    >
      {loading ? (
        <ActivityIndicator
          color={theme.colors.surface}
          size={sizeStyles.fontSize}
        />
      ) : (
        <Text
          style={[
            styles.text,
            {
              color: disabled
                ? theme.colors.onSurfaceDisabled
                : theme.colors.surface,
              fontSize: sizeStyles.fontSize,
            },
            textStyle,
          ]}
        >
          {children}
        </Text>
      )}
    </Pressable>
  );
}

export function IconButton({
  children,
  disabled,
  loading,
  style,
  textStyle,
  size,
  fullWidth,
  ...props
}: BaseButtonProps) {
  const theme = useAppTheme();
  const sizeStyles = getSizeStyles(size);

  return (
    <Pressable
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.button,
        {
          opacity: pressed ? 0.8 : 1,
          paddingVertical: sizeStyles.paddingVertical,
          paddingHorizontal: sizeStyles.paddingHorizontal,
          width: fullWidth ? "100%" : "auto",
        },
        style,
      ]}
      {...props}
    >
      {loading ? (
        <ActivityIndicator
          color={theme.colors.primary}
          size={sizeStyles.fontSize}
        />
      ) : (
        <View style={styles.iconButton}>{children}</View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  iconButton: {
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  text: {
    fontFamily: "Nunito-Medium",
    textAlign: "center",
  },
});
