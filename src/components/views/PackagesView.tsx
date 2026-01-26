import { Text } from "ink";
import { DependencyData } from "../../types";

type PackagesViewProps = {
  data: DependencyData[];
  selected: number;
  loading: boolean;
};

function PackagesView({ data, selected, loading }: PackagesViewProps) {
  return <Text>Packages View</Text>;
}

export default PackagesView;
