import { Box, Text } from "ink";
import { DependencyData } from "../../types";
import { formatSize } from "../../utils/formatting.js";

function DetailView({ data }: { data: DependencyData }) {
  const { dependency: dep, imports } = data;

  return (
    <Box flexDirection="column">
      <Box marginBottom={1}>
        <Text>
          <Text bold color="white">
            {dep.name}
          </Text>
          <Text dimColor> @{dep.version}</Text>
        </Text>
      </Box>
      <Box flexDirection="column">
        <Text>
          Size (gzipped):{" "}
          <Text bold color="green">
            {formatSize(dep.gzip || 0)}
          </Text>
        </Text>
      </Box>
      <Box marginTop={1} marginBottom={1}>
        <Text bold color="white">
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
        <Box padding={1} borderStyle="single" borderColor="gray">
          <Text dimColor>
            No imports found in source files (may be used in build config or
            tests)
          </Text>
        </Box>
      )}
      <Box marginTop={1} justifyContent="center">
        <Text dimColor>Press B or ESC to go back</Text>
      </Box>
    </Box>
  );
}

export default DetailView;
