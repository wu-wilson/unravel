import { Box, Text } from "ink";
import { DependencyData } from "../../types";
import { formatSize } from "../../utils/bundle.js";

type PackagesViewProps = {
  data: DependencyData[];
  selected: number;
  loading: boolean;
};

function PackagesView({ data, selected, loading }: PackagesViewProps) {
  const maxSize = Math.max(...data.map((d) => d.package.gzip || 0));
  const totalSize = data.reduce((sum, d) => sum + (d.package.gzip || 0), 0);

  if (loading) {
    return (
      <Box marginTop={1}>
        <Text color="yellow">⏳ Loading dependency info...</Text>
      </Box>
    );
  }

  return (
    <>
      <Box marginBottom={1}>
        <Text>
          Total:{" "}
          <Text bold color="yellow">
            {formatSize(totalSize)}
          </Text>
          <Text dimColor> ({data.length} packages)</Text>
        </Text>
      </Box>
      {data.map((item, idx) => {
        const { package: pkg, imports } = item;
        const isSelected = idx === selected;
        const percentage =
          maxSize > 0 ? ((pkg.gzip || 0) / totalSize) * 100 : 0;
        const barWidth =
          maxSize > 0 ? Math.floor(((pkg.gzip || 0) / maxSize) * 40) : 0;
        const bar =
          "█".repeat(barWidth) + "░".repeat(Math.max(0, 40 - barWidth));

        return (
          <Box key={pkg.name} flexDirection="column" marginBottom={1}>
            <Box>
              <Text
                backgroundColor={isSelected ? "blue" : undefined}
                color={isSelected ? "white" : undefined}
              >
                {isSelected ? " ▶ " : "   "}
                <Text bold>{pkg.name}</Text>
                <Text dimColor> @{pkg.version}</Text>
              </Text>
            </Box>
            <Box marginLeft={3}>
              {pkg.loading ? (
                <Text dimColor>⏳ Loading size...</Text>
              ) : pkg.error ? (
                <Text color="red">✗ {pkg.error}</Text>
              ) : (
                <Box gap={1}>
                  <Text color="cyan">{bar}</Text>
                  <Text bold color="yellow">
                    {formatSize(pkg.gzip || 0)}
                  </Text>
                  <Text dimColor>({percentage.toFixed(1)}%)</Text>
                  <Text dimColor>
                    • {imports.length}{" "}
                    {imports.length === 1 ? "import" : "imports"}
                  </Text>
                </Box>
              )}
            </Box>
          </Box>
        );
      })}
    </>
  );
}

export default PackagesView;
