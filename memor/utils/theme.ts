import { MD3LightTheme, MD3DarkTheme } from "react-native-paper";
import { DefaultTheme, DarkTheme } from "@react-navigation/native";

export const colors = {
  babyPowder: {
    DEFAULT: "#fffdfa",
    100: "#653d00",
    200: "#ca7900",
    300: "#ffac30",
    400: "#ffd595",
    500: "#fffdfa",
    600: "#fffdfb",
    700: "#fffefc",
    800: "#fffefd",
    900: "#fffffe",
  },
  jasper: {
    DEFAULT: "#ca6853",
    100: "#2c130d",
    200: "#57261b",
    300: "#833928",
    400: "#af4c36",
    500: "#ca6853",
    600: "#d58776",
    700: "#dfa598",
    800: "#eac3ba",
    900: "#f4e1dd",
  },
  vistaBlue: {
    DEFAULT: "#8590c8",
    100: "#15192e",
    200: "#29325b",
    300: "#3e4a89",
    400: "#5666b3",
    500: "#8590c8",
    600: "#9ca6d3",
    700: "#b5bcde",
    800: "#ced2e9",
    900: "#e6e9f4",
  },
  blackOlive: {
    DEFAULT: "#403b36",
    100: "#0d0c0b",
    200: "#191716",
    300: "#262320",
    400: "#332f2b",
    500: "#403b36",
    600: "#6a625a",
    700: "#938980",
    800: "#b7b0aa",
    900: "#dbd8d5",
  },
  flame: {
    DEFAULT: "#e64a19",
    100: "#2e0f05",
    200: "#5c1d0a",
    300: "#8a2c0f",
    400: "#b83a14",
    500: "#e64a19",
    600: "#eb6d47",
    700: "#f09275",
    800: "#f5b6a3",
    900: "#fadbd1",
  },
};

export const customLightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: colors.jasper.DEFAULT,
    secondary: colors.vistaBlue.DEFAULT,
    background: colors.babyPowder.DEFAULT,
    onSurfaceVariant: colors.babyPowder.DEFAULT,
    error: colors.flame.DEFAULT,
    surface: colors.babyPowder.DEFAULT,
    surfaceVariant: colors.babyPowder[100],
    onSurface: colors.blackOlive.DEFAULT,
    outline: colors.blackOlive[300],
  },
  fonts: {
    ...MD3LightTheme.fonts,
    regular: {
      fontFamily: "Nunito",
      fontWeight: "normal",
    },
    medium: {
      fontFamily: "Nunito",
      fontWeight: "500",
    },
    light: {
      fontFamily: "Nunito",
      fontWeight: "300",
    },
    thin: {
      fontFamily: "Nunito",
      fontWeight: "100",
    },
  },
};

export const customDarkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: colors.jasper[400],
    secondary: colors.vistaBlue[400],
    background: colors.blackOlive[200],
    surface: colors.blackOlive[300],
    surfaceVariant: colors.blackOlive[400],
    onBackground: colors.babyPowder.DEFAULT,
    onSurface: colors.babyPowder.DEFAULT,
    onSurfaceVariant: colors.babyPowder[800],
    error: colors.flame[400],
    outline: colors.blackOlive[600],
    elevation: {
      level0: colors.blackOlive[200],
      level1: colors.blackOlive[300],
      level2: colors.blackOlive[400],
      level3: colors.blackOlive[500],
    },
  },
  fonts: customLightTheme.fonts,
};

export const navigationLightTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: colors.jasper.DEFAULT,
    background: colors.babyPowder.DEFAULT,
    text: colors.blackOlive.DEFAULT,
    card: colors.babyPowder.DEFAULT,
    border: colors.blackOlive[200],
  },
};

export const navigationDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: colors.jasper[400],
    background: colors.blackOlive[200],
    text: colors.babyPowder.DEFAULT,
    card: colors.blackOlive[300],
    border: colors.blackOlive[400],
  },
};
