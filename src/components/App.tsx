import { Box, useApp, useInput } from "ink";
import { useDependencyData } from "../hooks/useDependencyData.js";
import { useState } from "react";
import { ViewMode } from "../types";
import Header from "./Header.js";
import PackagesView from "./views/PackagesView.js";
import CircularView from "./views/CircularView.js";
import DetailView from "./views/DetailView.js";

function App() {
  const { exit } = useApp();
  const { data, loading } = useDependencyData();
  const [mode, setMode] = useState<ViewMode>("packages");
  const [selected, setSelected] = useState(0);
  const [detailIndex, setDetailIndex] = useState<number | null>(null);

  useInput((input, key) => {
    if (input === "q" || input === "Q") {
      exit();
      return;
    }

    if (key.tab) {
      setMode((m) => (m === "packages" ? "circular" : "packages"));
      setSelected(0);
      return;
    }
  });

  return (
    <Box
      flexDirection="column"
      padding={1}
      borderStyle="single"
      borderColor="gray"
    >
      <Header mode={mode} />
      {detailIndex !== null ? (
        <DetailView data={data[detailIndex]} />
      ) : (
        <>
          {mode === "packages" ? (
            <PackagesView data={data} selected={selected} loading={loading} />
          ) : (
            <CircularView selected={selected} />
          )}
        </>
      )}
    </Box>
  );
}

export default App;
