import "./styles.css";
import Table from "./Table";
import data from "./data.json";

export default function App() {
  return (
    <div className="App">
      <Table data={data.slice(0, 10000)} />
    </div>
  );
}
