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
    <Box marginBottom={1}>
      <Text>
        Total:{" "}
        <Text bold color="yellow">
          {formatSize(totalSize)}
        </Text>
        <Text dimColor> ({data.length} packages)</Text>
      </Text>
    </Box>
  );
}

export default PackagesView;
