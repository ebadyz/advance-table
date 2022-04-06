import { Fragment, useReducer } from "react";
import produce from "immer";

export default function Table({ data = [] }) {
  const initialState = {
    data: data,
    sorts: {},
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
        const newFilters = {...state.filters, [action.name]: action.value || null}
        return {
          ...state,
          filters: newFilters,
          data: data.filter(item => {
            return  Object.entries(newFilters).filter(f => f[1] != null).reduce((all, curr) => {
              return all && item[curr[0]].toLowerCase().indexOf(curr[1].toLowerCase()) > -1
            }, true);
          })
        }
      }
      default:
        return state;
    }
  };
  const [state, dispatch] = useReducer(reducer, initialState);

  console.log(state)
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
                name: "name",
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
                name: "date",
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
                name: "title",
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
                name: "field",
                value: e.target.value,
              })
            }
          />
        </section>
      </div>
      <table>
        <thead>
          <tr>
            <th>نام</th>
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
