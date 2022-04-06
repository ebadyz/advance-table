import { Fragment, useReducer } from "react";
import { SortButtons } from "./SortButtons";

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
  // out = out.filter(item => {
  //   return  filters.reduce((all, curr) => {
  //     return all && item[curr[0]].toLowerCase().indexOf(curr[1].toLowerCase()) > -1
  //   }, true);
  // });

  return out;
}

export default function Table({ data = [] }) {
  const initialState = {
    data: data,
    // Sort state = ASC | DESC | null = null
    sorts: {
      name: null,
      date: null,
      title: null,
      field: null,
      oldValue: null,
      newValue: null,
    },
    filters: {
      name: null,
      date: null,
      title: null,
      field: null,
    },
  };
  const reducer = (state, action) => {
    switch (action.type) {
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
      default:
        return state;
    }
  };
  const [state, dispatch] = useReducer(reducer, initialState);

  console.log(state);
  return (
    <Fragment>
      <div style={{ display: "flex" }}>
        <section style={{ display: "flex", flexDirection: "column" }}>
          <label htmlFor="name">نام</label>
          <input
            type="text"
            name="name"
            id="name"
            value={state.name}
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
            value={state.date}
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
            value={state.ad}
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
            value={state.date}
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
            <th>تاریخ</th>
            <th>نام آگهی</th>
            <th>فیلد</th>
            <th>مقدار قدیمی</th>
            <th>مقدار جدید</th>
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
    </Fragment>
  );
}
