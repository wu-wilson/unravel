import { Box, Text } from "ink";
import { DependencyData } from "../../types";
import { formatSize } from "../../utils/format.js";

type PackagesViewProps = {
  data: DependencyData[];
  selected: number;
};

function PackagesView({ data, selected }: PackagesViewProps) {
  const maxSize = Math.max(...data.map((d) => d.dependency.gzip || 0));
  const totalSize = data.reduce((sum, d) => sum + (d.dependency.gzip || 0), 0);

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
        const { dependency: dep, imports } = item;
        const isSelected = idx === selected;
        const percentage =
          maxSize > 0 ? ((dep.gzip || 0) / totalSize) * 100 : 0;
        const barWidth =
          maxSize > 0 ? Math.floor(((dep.gzip || 0) / maxSize) * 40) : 0;
        const bar =
          "█".repeat(barWidth) + "░".repeat(Math.max(0, 40 - barWidth));

        return (
          <Box
            key={dep.name}
            flexDirection="column"
            marginBottom={1}
            marginTop={1}
          >
            <Text
              backgroundColor={isSelected ? "blue" : undefined}
              color={isSelected ? "white" : undefined}
            >
              {isSelected ? " ▶ " : "   "}
              <Text bold>{dep.name}</Text>
              <Text dimColor> @{dep.version}</Text>
            </Text>
            <Text>
              {"   "}
              {dep.error ? (
                <Text color="red">✗ {dep.error}</Text>
              ) : (
                <>
                  <Text color="cyan">{bar}</Text>{" "}
                  <Text bold color="yellow">
                    {formatSize(dep.gzip || 0)}
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
