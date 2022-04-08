import "./styles.css";
import { Table } from "./Table";
import data from "./data.json";
import { useState } from "react";
import InfiniteScroll from "react-infinite-scroll-component";

const PER_PAGE = 100;

export default function App() {
  const [state, setState] = useState({
    page: 1,
    data: data.slice(0, PER_PAGE),
  });
  return (
    <div className="App">
    <Table
      data={state.data}
      total={data.length}
      hasMore={state.page <= data.length / PER_PAGE}
      loadMoreData={() => {
        console.log("load more");
        setState({
          page: state.page + 1,
          data: data.slice(0, PER_PAGE * (state.page + 1)),
        });
      }}
    />
    </div>
  );
}
