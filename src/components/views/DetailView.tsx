import { Box, Text } from "ink";
import { DependencyData } from "../../types";
import { formatSize } from "../../utils/formatting.js";

function DetailView({ data }: { data: DependencyData }) {
  const { dependency, imports } = data;

  return (
    <Box flexDirection="column">
      <Box marginBottom={1}>
        <Text bold>{dependency.name}</Text>
        <Text dimColor> @{dependency.version}</Text>
      </Box>
      <Text>
        Size (gzipped):{" "}
        <Text bold color="green">
          {formatSize(dependency.gzip || 0)}
        </Text>
      </Text>
      <Box marginY={1}>
        <Text bold>
          📍 Imported in {imports.length} file{imports.length !== 1 ? "s" : ""}:
        </Text>
      </Box>
      {imports.length > 0 ? (
        <Box flexDirection="column" marginBottom={1}>
          {imports.map((imp, idx) => (
            <Box
              key={idx}
              flexDirection="column"
              marginBottom={1}
              paddingLeft={1}
            >
              <Text>
                <Text color="cyan">{imp.file}</Text>
                <Text color="yellow">:{imp.line}</Text>
              </Text>
              <Box marginLeft={2}>
                <Text dimColor>{imp.importStatement}</Text>
              </Box>
            </Box>
          ))}
        </Box>
      ) : (
        <Box paddingX={1} paddingY={0} borderStyle="single" borderColor="gray">
          <Text dimColor>
            No imports found in source files (may be used in build config or
            tests)
          </Text>
        </Box>
      )}
      <Box marginTop={1} justifyContent="center">
        <Text dimColor>Press b or ESC to go back</Text>
      </Box>
    </Box>
  );
}

export default DetailView;
