import { Box, Text } from "ink";
import { DependencyData } from "../../types";
import { formatSize } from "../../utils/formatting.js";

type PackagesViewProps = {
  data: DependencyData[];
  selected: number;
};

function PackagesView({ data, selected }: PackagesViewProps) {
  const totalSize = data.reduce((sum, d) => sum + (d.dependency.gzip || 0), 0);
  const maxSize = Math.max(...data.map((d) => d.dependency.gzip || 0));

  return (
    <Box flexDirection="column">
      <Text>
        Total:{" "}
        <Text bold color="yellow">
          {formatSize(totalSize)}
        </Text>
        <Text dimColor> ({data.length} packages)</Text>
      </Text>
      {data.map((item, idx) => {
        const { dependency, imports } = item;
        const isSelected = idx === selected;
        const gzipSize = dependency.gzip || 0;
        const percentage = totalSize > 0 ? (gzipSize / totalSize) * 100 : 0;
        const barWidth =
          maxSize > 0 ? Math.floor((gzipSize / maxSize) * 40) : 0;
        const bar = "█".repeat(barWidth) + "░".repeat(40 - barWidth);

        return (
          <Box key={dependency.name} flexDirection="column" marginY={1}>
            <Text backgroundColor={isSelected ? "blue" : undefined}>
              {isSelected ? " ▶ " : "   "}
              <Text bold>{dependency.name}</Text>
              <Text dimColor> @{dependency.version}</Text>
            </Text>
            <Text>
              {"   "}
              {dependency.error ? (
                <Text color="red">✗ {dependency.error}</Text>
              ) : (
                <>
                  <Text color="cyan">{bar}</Text>{" "}
                  <Text bold color="yellow">
                    {formatSize(gzipSize)}
                  </Text>{" "}
                  <Text dimColor>({percentage.toFixed(1)}%)</Text>{" "}
                  <Text dimColor>
                    • {imports.length}{" "}
                    {imports.length === 1 ? "import" : "imports"}
                  </Text>
                </>
              )}
            </Text>
          </Box>
        );
      })}
    </Box>
  );
}

export default PackagesView;
