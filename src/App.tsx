import { Box, Text, useApp, useInput } from "ink";
import { useDependencyData } from "./hooks/useDependencyData.js";
import { useState } from "react";
import Header from "./components/layout/Header.js";
import PackagesView from "./components/views/PackagesView.js";
import DetailView from "./components/views/DetailView.js";

function App() {
  const { exit } = useApp();
  const { data, loading } = useDependencyData();

  const [selected, setSelected] = useState(0);
  const [detailIndex, setDetailIndex] = useState<number | null>(null);

  useInput((input, key) => {
    if (input === "q") {
      exit();
      return;
    }

    if (detailIndex !== null) {
      if (key.escape || input === "b") {
        setDetailIndex(null);
      }
      return;
    }

    if (key.upArrow) {
      setSelected((s) => Math.max(0, s - 1));
    } else if (key.downArrow) {
      setSelected((s) => Math.min(data.length - 1, s + 1));
    } else if (key.return && data[selected]) {
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
