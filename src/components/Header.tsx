import { Box, Text } from "ink";

function Header() {
  return (
    <Box flexDirection="column" marginBottom={1}>
      <Box>
        <Text bold color="cyan">
          🌀 Unravel
        </Text>
      </Box>
      <Box marginTop={1} flexDirection="column">
        <Text dimColor>
          Tab: Switch Mode | ↑↓: Navigate | Q: Quit | Enter: Select
        </Text>
      </Box>
    </Box>
  );
}

export default Header;
