import { Box, Text, useApp, useInput } from "ink";
import { useDependencyData } from "../hooks/useDependencyData.js";
import { useState } from "react";
import Header from "./Header.js";
import PackagesView from "./views/PackagesView.js";
import DetailView from "./views/DetailView.js";

function App() {
  const { exit } = useApp();
  const { data, loading } = useDependencyData();

  const [selected, setSelected] = useState(0);
  const [detailIndex, setDetailIndex] = useState<number | null>(null);

  useInput((input, key) => {
    if (input === "q" || input === "Q") {
      exit();
      return;
    }

    if (detailIndex !== null) {
      if (key.escape || input === "b" || input === "B") {
        setDetailIndex(null);
      }
      return;
    }

    if (key.upArrow && detailIndex === null) {
      setSelected((s) => Math.max(0, s - 1));
    }

    if (key.downArrow && detailIndex === null) {
      setSelected((s) => Math.min(data.length - 1, s + 1));
    }

    if (key.return && data[selected]) {
      setDetailIndex(selected);
    }
  });

  return (
    <Box
      flexDirection="column"
      padding={1}
      borderStyle="single"
      borderColor="gray"
    >
      <Header />

      {loading ? (
        <Text color="yellow">Loading dependency info...</Text>
      ) : detailIndex === null ? (
        <PackagesView data={data} selected={selected} />
      ) : (
        <DetailView data={data[detailIndex]} />
      )}
    </Box>
  );
}

export default App;
