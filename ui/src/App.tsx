import { createTheme, MantineProvider } from "@mantine/core";

const theme = createTheme({
  /** Put your mantine theme override here */
  fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
});

export function App() {
  return <MantineProvider theme={theme}></MantineProvider>;
}
