import {
  Fragment,
  useReducer,
  useEffect,
  useRef,
  useLayoutEffect,
} from "react";
import { SortButtons } from "./SortButtons";
import { updateQueryString } from "./utils";

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

export default function Table({ data = [] }) {
  const searchParams = useRef(new URLSearchParams(window.location.search));
  const initialState = {
    data: data,
    // TODO: initialize from local storage
    starred: [],
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
  console.log({ initialState });
  const reducer = (state, action) => {
    switch (action.type) {
      case "SEARCH": {
        return {
          ...state,
          data: sortAndFilter(data, state.sorts, state.filters),
        };
      }
      case "FILTER": {
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
          starred: state.starred.concat(action.id),
        };
      }
      default:
        return state;
    }
  };
  const [state, dispatch] = useReducer(reducer, initialState);

  // sort and filter at first based on read query string
  useLayoutEffect(() => {
    dispatch({ type: "SEARCH" });
  }, []);

  // Update query string on state change
  useEffect(() => {
    const { filters, sorts } = state;
    updateQueryString({ filters, sorts });
  }, [state]);

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
            onChange={(e) =>
              dispatch({
                type: "FILTER",
                by: "name",
                value: e.target.value,
              })
            }
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
              dispatch({
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
              dispatch({
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
              dispatch({
                type: "FILTER",
                by: "field",
                value: e.target.value,
              })
            }
          />
        </section>
      </div>
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
            <th>ستاره دار</th>
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
              <td>
                <input
                  type="checkbox"
                  onChange={() => {
                    dispatch({ type: "STAR", id: row.id });
                  }}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Fragment>
  );
}
