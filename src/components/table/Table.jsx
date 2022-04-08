import {
  Fragment,
  useReducer,
  useEffect,
  useRef,
  useLayoutEffect,
  useCallback,
} from "react";
import { SortButtons } from "../sort-buttons/SortButtons";
import { updateQueryString, omit } from "../../utils";
import debounce from "lodash.debounce";
import { InfiniteScroll } from "react-simple-infinite-scroll";
import "../table/style.css";

function sortByOrder(a, b, prop, order) {
  switch (order) {
    case "DESC": {
      return a[prop] < b[prop] ? -1 : 1;
    }
    case "ASC": {
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

export function Table({ data, loadMoreData, hasMore }) {
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
      case "TOGGLE_STAR": {
        // Unstar an already starred item
        if (state.starred?.hasOwnProperty(action.id)) {
          return {
            ...state,
            starred: omit(state.starred, action.id),
          };
        }
        // Start an item
        else {
          return {
            ...state,
            starred: { ...state.starred, [action.id]: true },
          };
        }
      }
      case "MORE_DATA": {
        return {
          ...state,
          data: sortAndFilter(action.data, state.sorts, state.filters),
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
    console.log("persist starred");
    localStorage.setItem("starred", JSON.stringify(state.starred));
  }, [state.starred]);

  // When new paginated data arrives, save it in the state
  useEffect(() => {
    dispatch({ type: "MORE_DATA", data });
  }, [data]);

  // TODO: Make a table renderer
  return (
    <Fragment>
      <div className="filter-section">
        <section className="col-4 textfield-wrapper">
          <label htmlFor="name">نام تغییر دهنده</label>
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
        <section className="col-2 textfield-wrapper">
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
        <section className="col-3 textfield-wrapper">
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
        <section className="col-3 textfield-wrapper">
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
        onLoadMore={() => {
          loadMoreData();
        }}
        threshold={200}
        throttle={100}
        hasMore={hasMore}
      >
        <table className="table-container">
          <thead className="table-head">
            <tr className="table-row">
              <th>
                <SortButtons
                  order={state.sorts.name}
                  onSort={(order) => {
                    dispatch({ type: "SORT", by: "name", order });
                  }}
                />
                نام تغییر دهنده
              </th>
              <th>
                <SortButtons
                  order={state.sorts.date}
                  onSort={(order) => {
                    dispatch({ type: "SORT", by: "date", order });
                  }}
                />
                تاریخ
              </th>
              <th>
                <SortButtons
                  order={state.sorts.title}
                  onSort={(order) => {
                    dispatch({ type: "SORT", by: "title", order });
                  }}
                />
                نام آگهی
              </th>
              <th>
                <SortButtons
                  order={state.sorts.field}
                  onSort={(order) => {
                    dispatch({ type: "SORT", by: "field", order });
                  }}
                />
                فیلد
              </th>
              <th>
                <SortButtons
                  order={state.sorts.oldValue}
                  onSort={(order) => {
                    dispatch({ type: "SORT", by: "oldValue", order });
                  }}
                />
                مقدار قدیمی
              </th>
              <th>
                <SortButtons
                  order={state.sorts.newValue}
                  onSort={(order) => {
                    dispatch({ type: "SORT", by: "newValue", order });
                  }}
                />
                مقدار جدید
              </th>
              <th>ستاره</th>
            </tr>
          </thead>

          <tbody>
            {state.data.map((row) => (
              <tr key={row.id} className="table-row">
                <td className="table-data">{row.name}</td>
                <td className="table-data">{row.date}</td>
                <td className="table-data">{row.title}</td>
                <td className="table-data">{row.field}</td>
                <td className="table-data">{row.old_value}</td>
                <td className="table-data">{row.new_value}</td>
                <td className="table-data">
                  {state.starred?.hasOwnProperty(row.id) ? (
                    <svg
                      onClick={() => {
                        debouncedDispatch({ type: "TOGGLE_STAR", id: row.id });
                      }}
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      x="0px"
                      y="0px"
                      viewBox="0 0 940.688 940.688"
                    >
                      <path
                        fillRule="evenodd"
                        fill="currentColor"
                        d="M885.344,319.071l-258-3.8l-102.7-264.399c-19.8-48.801-88.899-48.801-108.6,0l-102.7,264.399l-258,3.8
        c-53.4,3.101-75.1,70.2-33.7,103.9l209.2,181.4l-71.3,247.7c-14,50.899,41.1,92.899,86.5,65.899l224.3-122.7l224.3,122.601
        c45.4,27,100.5-15,86.5-65.9l-71.3-247.7l209.2-181.399C960.443,389.172,938.744,322.071,885.344,319.071z"
                      />
                    </svg>
                  ) : (
                    <svg
                      onClick={() => {
                        debouncedDispatch({ type: "TOGGLE_STAR", id: row.id });
                      }}
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 248.294 248.294"
                    >
                      <path
                        fillRule="evenodd"
                        fill="currentColor"
                        d="M55.688,242.322c2.882,0,6.069-0.719,9.439-2.24l59.032-32.156l59.032,32.156c3.369,1.521,6.557,2.24,9.437,2.24
          c8.933,0,14.963-6.917,14.543-18.36l-7.71-65.312l44.062-45.268c9.166-12.062,4.732-25.004-9.908-28.908l-65.53-10.529
          l-28.932-58.22c-4.242-6.49-9.959-9.754-15.732-9.754c-5.512,0-11.063,2.973-15.422,8.952L74.461,73.941l-59.893,10.06
          c-14.566,4.163-18.943,17.314-9.777,29.377l44.06,45.264l-7.71,65.311C40.721,235.405,46.753,242.322,55.688,242.322z
           M20.734,102.347l56.896-9.558l8.961-1.505l4.492-7.906l32.191-56.649l27.689,55.713l4.378,8.809l9.712,1.557l62.101,9.98
          l-41.388,42.515l-6.353,6.534l1.064,9.045l7.057,59.795l-54.231-29.548l-9.145-4.979l-9.147,4.979l-54.227,29.548l7.052-59.795
          l1.066-9.045l-6.352-6.534L20.734,102.347z"
                      />
                    </svg>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </InfiniteScroll>
    </Fragment>
  );
}
