import {
  Fragment,
  useReducer,
  useEffect,
  useRef,
  useLayoutEffect,
  useCallback,
} from "react";
import { SortButtons } from "./SortButtons";
import { updateQueryString } from "./utils";
import debounce from "lodash.debounce";
import InfiniteScroll from "react-infinite-scroll-component";

function sortByOrder(a, b, prop, order) {
  switch (order) {
    case "ASC": {
      return a[prop] < b[prop] ? -1 : 1;
    }
    case "DESC": {
      return a[prop] > b[prop] ? -1 : 1;
    }
    default:
      return 0;
  }
}

const makeDebouncedDispatch = (dispatch) => debounce(dispatch, 300);

function sortAndFilter(array, sorts, filters) {
  // TODO: expensive clone
  let out = array.slice();

  // Apply sorts
  // !Buggy sort. Does NOT work with multiple criteria
  Object.keys(sorts).forEach((key) => {
    if (sorts[key] != null) {
      out = out.sort((a, b) => sortByOrder(a, b, key, sorts[key]));
    }
  });

  // Apply filters
  Object.keys(filters).forEach((key) => {
    if (filters[key] != null) {
      out = out.filter(
        (item) =>
          item[key].toLowerCase().indexOf(filters[key].toLowerCase()) > -1
      );
    }
  });

  return out;
}

export function Table({ data, loadMoreData, hasMore, total }) {
  const searchParams = useRef(new URLSearchParams(window.location.search));
  const initialState = {
    data: data,
    // TODO: initialize from local storage
    starred: JSON.parse(localStorage.getItem("starred")),
    // Sort state = ASC | DESC | null = null
    sorts: {
      name: searchParams.current.get("sort_name"),
      date: searchParams.current.get("sort_date"),
      title: searchParams.current.get("sort_title"),
      field: searchParams.current.get("sort_field"),
      oldValue: searchParams.current.get("sort_oldValue"),
      newValue: searchParams.current.get("sort_newValue"),
    },
    filters: {
      // TODO: loop here
      name: searchParams.current.get("filter_name"),
      date: searchParams.current.get("filter_date"),
      title: searchParams.current.get("filter_title"),
      field: searchParams.current.get("filter_field"),
    },
  };
  const reducer = (state, action) => {
    switch (action.type) {
      case "SEARCH": {
        return {
          ...state,
          data: sortAndFilter(data, state.sorts, state.filters),
        };
      }
      case "FILTER": {
        console.log(action);
        const newFilters = {
          ...state.filters,
          [action.by]: action.value || null,
        };
        return {
          ...state,
          filters: newFilters,
          data: sortAndFilter(data, state.sorts, newFilters),
        };
      }
      case "SORT": {
        const newSorts = {
          ...state.sorts,
          // Cancel a sort order on sending the same order twice in a row
          [action.by]:
            state.sorts[action.by] === action.order
              ? null
              : action.order || null,
        };
        return {
          ...state,
          sorts: newSorts,
          data: sortAndFilter(data, newSorts, state.filters),
        };
      }
      case "STAR": {
        return {
          ...state,
          starred: { ...state.starred, [action.id]: true },
        };
      }
      case "MORE_DATA": {
        return {
          ...state,
          data: sortAndFilter(action.data, state.sorts, state.filters),
        };
      }
      case "LOAD_MORE": {
        return {
          ...state,
          data: state.data.concat(
            state.data.map((x) => ({ ...x, id: x.id + Math.random() }))
          ),
        };
      }
      default:
        return state;
    }
  };
  const [state, dispatch] = useReducer(reducer, initialState);
  const debouncedDispatch = useCallback(makeDebouncedDispatch(dispatch), []);

  // sort and filter at first based on read query string
  useLayoutEffect(() => {
    dispatch({ type: "SEARCH" });
  }, []);

  // Update query string on state change
  useEffect(() => {
    const { filters, sorts } = state;
    updateQueryString({ filters, sorts });
  }, [state.filters, state.sorts]);

  // Persist starred items to localstorage
  useEffect(() => {
    localStorage.setItem("starred", JSON.stringify(state.starred));
  }, [state.starred]);

  // console.log(state);
  // When new paginated data arrives, save it in the state
  useEffect(() => {
    console.log("data changed");
    dispatch({ type: "MORE_DATA", data });
  }, [data]);

  console.log(state);
  // TODO: Make a table renderer
  return (
    <Fragment>
      <div style={{ display: "flex" }}>
        <section style={{ display: "flex", flexDirection: "column" }}>
          <label htmlFor="name">نام</label>
          <input
            type="text"
            name="name"
            id="name"
            defaultValue={state.filters.name}
            onChange={(e) => {
              debouncedDispatch({
                type: "FILTER",
                by: "name",
                value: e.target.value,
              });
            }}
          />
        </section>
        <section style={{ display: "flex", flexDirection: "column" }}>
          <label htmlFor="date">تاریخ</label>
          <input
            type="text"
            name="date"
            id="date"
            defaultValue={state.filters.date}
            onChange={(e) =>
              debouncedDispatch({
                type: "FILTER",
                by: "date",
                value: e.target.value,
              })
            }
          />
        </section>
        <section style={{ display: "flex", flexDirection: "column" }}>
          <label htmlFor="title">نام آگهی</label>
          <input
            type="text"
            name="title"
            id="title"
            defaultValue={state.filters.title}
            onChange={(e) =>
              debouncedDispatch({
                type: "FILTER",
                by: "title",
                value: e.target.value,
              })
            }
          />
        </section>
        <section style={{ display: "flex", flexDirection: "column" }}>
          <label htmlFor="field">فیلد</label>
          <input
            type="text"
            name="field"
            id="field"
            defaultValue={state.filters.field}
            onChange={(e) =>
              debouncedDispatch({
                type: "FILTER",
                by: "field",
                value: e.target.value,
              })
            }
          />
        </section>
      </div>
      <InfiniteScroll
        dataLength={total}
        next={() => {
          console.log("next");
          dispatch({ type: "LOAD_MORE" });
        }}
        hasMore={hasMore}
        loader={<div className="loader">Loading ...</div>}
        endMessage={<p>The end</p>}
      >
        <table>
          <thead>
            <tr>
              <th>
                نام{" "}
                <SortButtons
                  order={state.sorts.name}
                  onSort={(order) => {
                    dispatch({ type: "SORT", by: "name", order });
                  }}
                />
              </th>
              <th>
                {" "}
                <SortButtons
                  order={state.sorts.date}
                  onSort={(order) => {
                    dispatch({ type: "SORT", by: "date", order });
                  }}
                />
                تاریخ
              </th>
              <th>
                {" "}
                <SortButtons
                  order={state.sorts.title}
                  onSort={(order) => {
                    dispatch({ type: "SORT", by: "title", order });
                  }}
                />
                نام آگهی
              </th>
              <th>
                {" "}
                <SortButtons
                  order={state.sorts.field}
                  onSort={(order) => {
                    dispatch({ type: "SORT", by: "field", order });
                  }}
                />
                فیلد
              </th>
              <th>
                {" "}
                <SortButtons
                  order={state.sorts.oldValue}
                  onSort={(order) => {
                    dispatch({ type: "SORT", by: "oldValue", order });
                  }}
                />
                مقدار قدیمی
              </th>
              <th>
                {" "}
                <SortButtons
                  order={state.sorts.newValue}
                  onSort={(order) => {
                    dispatch({ type: "SORT", by: "newValue", order });
                  }}
                />
                مقدار جدید
              </th>
            </tr>
          </thead>

          <tbody>
            {state.data.map((row) => (
              <tr key={row.id}>
                <td>{row.name}</td>
                <td>{row.date}</td>
                <td>{row.title}</td>
                <td>{row.field}</td>
                <td>{row.old_value}</td>
                <td>{row.new_value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </InfiniteScroll>
    </Fragment>
  );
}
