import { Box, Text } from "ink";
import { ViewMode } from "../types";

function Header({ mode }: { mode: ViewMode }) {
  return (
    <Box flexDirection="column" marginBottom={1}>
      <Box>
        <Text bold color="cyan">
          🌀 Unravel
        </Text>
      </Box>
      <Box marginTop={1} gap={2}>
        <Box>
          <Text color={mode === "packages" ? "green" : "gray"}>
            {mode === "packages" ? "●" : "○"} Packages
          </Text>
        </Box>
        <Box>
          <Text color={mode === "circular" ? "green" : "gray"}>
            {mode === "circular" ? "●" : "○"} Circular Deps
          </Text>
        </Box>
      </Box>
      <Box marginTop={1} flexDirection="column">
        {mode === "packages" ? (
          <Text dimColor>
            Tab: Switch Mode | ↑↓: Navigate | Q: Quit | Enter: Select
          </Text>
        ) : (
          <Text dimColor>Tab: Switch Mode | ↑↓: Navigate | Q: Quit</Text>
        )}
      </Box>
    </Box>
  );
}

export default Header;
